import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, ago, storedUser } from "../Api";
import AuthImg from "../components/AuthImg";
import Chat from "./Chat";

// One Lost & Found post: photo, details, the PRIVACY-GATED contact block, and
// the private owner ↔ finder chat. Contact unlocks for the visitor only after
// their chat exists (server-enforced; admin sees everything).
export default function ItemDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null); // null = loading, false = missing
  const [contact, setContact] = useState(null); // null = checking, false = locked
  const [chatOpen, setChatOpen] = useState(false); // flips when the chat is created
  const [marking, setMarking] = useState(false);
  const me = storedUser();

  useEffect(() => {
    let alive = true;
    api(`/items/${id}`)
      .then((j) => alive && setItem(j.item))
      .catch(() => alive && setItem(false));
    return () => {
      alive = false;
    };
  }, [id]);

  const isOwner =
    item && me && String(item.owner?._id ?? item.owner) === String(me.id);

  // contact gate — re-checked when a chat opens (that's what unlocks it)
  useEffect(() => {
    if (!item) return;
    let alive = true;
    api(`/items/${item._id}/contact`)
      .then((j) => alive && setContact(j))
      .catch(() => alive && setContact(false));
    return () => {
      alive = false;
    };
  }, [item, chatOpen]);

  const markReturned = async () => {
    setMarking(true);
    try {
      const j = await api(`/items/${id}`, { method: "PATCH", body: { status: "Returned" } });
      setItem(j.item);
    } catch {
      // leave status as-is on failure
    } finally {
      setMarking(false);
    }
  };

  if (item === false) {
    return (
      <div className="dash-page">
        <div className="dash-empty">
          <p>Item not found.</p>
          <span>
            <Link to="/dashboard/lost-found">Back to Lost &amp; Found</Link>
          </span>
        </div>
      </div>
    );
  }
  if (!item) {
    return (
      <div className="dash-page">
        <p className="detail-nophotos">Loading…</p>
      </div>
    );
  }

  return (
    <div className="dash-page">
      <div className="dash-crumbs">
        <Link to="/dashboard/lost-found">← Lost &amp; Found</Link>
        <i>›</i>
        <span>{item.title}</span>
      </div>

      <div className="dash-twoCol detail">
        <div className="dash-maincol">
          <section className="dash-card detail-head">
            <AuthImg id={item.image} className="lf-photo-lg" alt={item.title} />
            <div className="detail-headinfo">
              <h1>{item.title}</h1>
              <div className="detail-badges">
                <span className={`dash-pill ${item.kind === "Lost" ? "p-high" : "p-low"}`}>
                  {item.kind === "Lost" ? "Lost" : "Found"}
                </span>
                <span className={`dash-status s-${item.status?.toLowerCase()}`}>
                  {item.status}
                </span>
              </div>
              <div className="detail-meta">
                <span>🏷 {item.category}</span>
                <span>📍 {item.location || "—"}</span>
                <span>🗓 Posted {ago(item.createdAt)}</span>
                <span>👤 {item.owner?.name || "CampusFix student"}</span>
              </div>
              {isOwner && item.status !== "Returned" && (
                <button
                  className="dash-ghostbtn"
                  type="button"
                  onClick={markReturned}
                  disabled={marking}
                >
                  {marking ? "Saving…" : "✓ Mark as Returned"}
                </button>
              )}
            </div>
          </section>

          <section className="dash-card">
            <div className="dash-cardhead">
              <h2>Description</h2>
            </div>
            <p className="detail-desc">{item.desc}</p>
          </section>
        </div>

        <aside className="dash-rail">
          <section className="dash-card">
            <div className="dash-cardhead">
              <h2>Contact</h2>
            </div>
            {contact === null ? (
              <p className="detail-nophotos">Checking…</p>
            ) : contact ? (
              contact.contactPhone ? (
                <div className="profile-fields">
                  <div className="profile-field">
                    <small>{contact.contactName || "Poster"}</small>
                    <b>{contact.contactPhone}</b>
                  </div>
                </div>
              ) : (
                <div className="dash-empty">
                  <p>No number shared.</p>
                  <span>The poster prefers to connect through chat only.</span>
                </div>
              )
            ) : (
              <div className="dash-empty">
                <p>Contact is private.</p>
                <span>
                  Send the first message in the chat — the contact is revealed
                  once a conversation exists.
                </span>
              </div>
            )}
          </section>

          <section className="dash-card">
            <div className="dash-cardhead">
              <h2>Messages</h2>
              <span className="dash-viewall">Private chat</span>
            </div>
            <Chat
              refType="item"
              refId={id}
              onConversationOpen={() => setChatOpen(true)}
            />
          </section>
        </aside>
      </div>
    </div>
  );
}
