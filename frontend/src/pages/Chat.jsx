import { useCallback, useEffect, useRef, useState } from "react";
import { api, ago, storedUser } from "../Api";

// Shared chat used by IssueDetail (student ↔ management) and ItemDetail
// (owner ↔ finder). The thread is created lazily on the first message, so a
// fresh issue/item just shows an input until someone writes. Polling keeps it
// live without websockets — the ?after= cursor means each tick only ships
// messages we haven't seen.
export default function Chat({ refType, refId, onConversationOpen }) {
  const me = storedUser();
  const [convoId, setConvoId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const cursor = useRef(null); // createdAt of the newest message we've seen
  const busy = useRef(false); // no overlapping polls

  // is this thread already open for me? (one list call, matched client-side)
  useEffect(() => {
    let alive = true;
    api("/conversations")
      .then((json) => {
        if (!alive) return;
        const convo = json.conversations.find(
          (c) => c.refType === refType && c.refId === refId
        );
        if (convo) setConvoId(convo._id);
      })
      .catch(() => {}); // no thread yet — the input still works
    return () => {
      alive = false;
    };
  }, [refType, refId]);

  const load = useCallback(async () => {
    if (!convoId || busy.current) return;
    busy.current = true;
    try {
      const after = cursor.current ? `?after=${encodeURIComponent(cursor.current)}` : "";
      const json = await api(`/conversations/${convoId}/messages${after}`);
      if (json.messages.length) {
        cursor.current = json.messages[json.messages.length - 1].createdAt;
        setMessages((prev) => {
          const seen = new Set(prev.map((m) => m._id));
          const fresh = json.messages.filter((m) => !seen.has(m._id));
          return fresh.length ? [...prev, ...fresh] : prev;
        });
        api(`/conversations/${convoId}/read`, { method: "POST" }).catch(() => {});
      }
    } catch {
      // polling errors are transient — the next tick retries
    } finally {
      busy.current = false;
    }
  }, [convoId]);

  useEffect(() => {
    if (!convoId) return undefined;
    load();
    const timer = setInterval(load, 5000);
    return () => clearInterval(timer);
  }, [convoId, load]);

  const send = async (e) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text || busy.current) return;
    setError("");
    try {
      if (!convoId) {
        // first message — creates the thread
        const json = await api("/conversations", {
          method: "POST",
          body: { refType, refId, text },
        });
        setConvoId(json.conversation._id);
        cursor.current = json.message?.createdAt || new Date().toISOString();
        if (json.message) {
          // the POST returns a bare sender id — decorate with our own profile
          setMessages([
            {
              ...json.message,
              sender: { _id: me?.id, name: me?.name, role: me?.role },
            },
          ]);
        }
        onConversationOpen?.();
      } else {
        const json = await api(`/conversations/${convoId}/messages`, {
          method: "POST",
          body: { text },
        });
        setMessages((prev) =>
          prev.some((m) => m._id === json.message._id)
            ? prev
            : [
                ...prev,
                {
                  ...json.message,
                  sender: { _id: me?.id, name: me?.name, role: me?.role },
                },
              ]
        );
      }
      setDraft("");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <div className="dash-commentlist chat-scroll">
        {messages.length === 0 ? (
          <p className="detail-nophotos chat-hint">
            {convoId
              ? "No messages yet."
              : refType === "issue"
                ? "Ask management anything about this issue — your conversation is private."
                : "Send the first message to connect with the poster privately."}
          </p>
        ) : (
          messages.map((m) => {
            const own = String(m.sender?._id ?? m.sender) === String(me?.id);
            return (
              <div className={`chat-msg ${own ? "mine" : "theirs"}`} key={m._id}>
                <div className="chat-bubble">
                  {!own && (
                    <small className="chat-who">
                      {m.sender?.name || "?"}
                      {m.sender?.position ? ` · ${m.sender.position}` : ""}
                    </small>
                  )}
                  <p>{m.text}</p>
                  <small className="chat-time">{ago(m.createdAt)}</small>
                </div>
              </div>
            );
          })
        )}
      </div>
      <form className="dash-commentform" onSubmit={send}>
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Write a message…"
        />
        <button
          className="dash-btn small chat-send"
          type="submit"
          disabled={!draft.trim()}
          aria-label="Send message"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </form>
      {error && <p className="detail-nophotos">{error}</p>}
    </>
  );
}
