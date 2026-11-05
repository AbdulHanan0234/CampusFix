import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, ago } from "../Api";

const TABS = ["All", "Unread"];

export default function Notifications() {
  const [tab, setTab] = useState("All");
  const [items, setItems] = useState(null); // null = still loading
  const navigate = useNavigate();

  useEffect(() => {
    let alive = true;
    api("/notifications")
      .then((j) => alive && setItems(j.notifications))
      .catch(() => alive && setItems([]));
    return () => {
      alive = false;
    };
  }, []);

  const unreadCount = (items || []).filter((n) => !n.read).length;
  const shown = tab === "Unread" ? (items || []).filter((n) => !n.read) : items || [];

  // clicking a row marks it read and follows its deep link (issue/item)
  const open = async (n) => {
    if (!n.read) {
      setItems((prev) =>
        prev.map((x) => (x._id === n._id ? { ...x, read: true } : x))
      );
      api(`/notifications/${n._id}/read`, { method: "POST" }).catch(() => {});
    }
    if (n.link) navigate(n.link);
  };

  const markAll = () => {
    setItems((prev) => prev.map((x) => ({ ...x, read: true })));
    api("/notifications/read-all", { method: "POST" }).catch(() => {});
  };

  return (
    <div className="dash-page">
      <div className="dash-pagehead row">
        <div>
          <h1>Notifications</h1>
          <p>Updates about your issues and campus announcements.</p>
        </div>
        {unreadCount > 0 && (
          <button className="dash-ghostbtn" type="button" onClick={markAll}>
            Mark all as read
          </button>
        )}
      </div>

      <section className="dash-card">
        <div className="dash-filterbar">
          <div className="dash-chips">
            {TABS.map((t) => (
              <button
                type="button"
                key={t}
                className={tab === t ? "dash-chip on" : "dash-chip"}
                onClick={() => setTab(t)}
              >
                {t}
                {t === "Unread" && unreadCount > 0 && ` (${unreadCount})`}
              </button>
            ))}
          </div>
        </div>

        {items === null ? (
          <p className="detail-nophotos">Loading…</p>
        ) : shown.length ? (
          <div className="dash-notiflist big">
            {shown.map((n) => (
              <button
                type="button"
                className={n.read ? "dash-notifrow" : "dash-notifrow unread"}
                key={n._id}
                onClick={() => open(n)}
              >
                <span className={`dash-notific t-${n.tone}`}>{n.glyph}</span>
                <span className="dash-notifinfo">
                  <b>{n.title}</b>
                  <small>{ago(n.createdAt)}</small>
                </span>
                {!n.read && <i className="dash-unreaddot" />}
              </button>
            ))}
          </div>
        ) : (
          <div className="dash-empty">
            <p>You&apos;re all caught up.</p>
            <span>No {tab === "Unread" ? "unread " : ""}notifications.</span>
          </div>
        )}
      </section>
    </div>
  );
}
