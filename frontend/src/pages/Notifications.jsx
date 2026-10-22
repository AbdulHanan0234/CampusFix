import { useState } from "react";
import { NOTIFICATIONS } from "../data/mock";

const TABS = ["All", "Unread"];

export default function Notifications() {
  const [tab, setTab] = useState("All");
  const [read, setRead] = useState(
    NOTIFICATIONS.filter((n) => !n.unread).map((n) => n.title)
  );

  const isUnread = (n) => !read.includes(n.title);
  const shown = tab === "Unread" ? NOTIFICATIONS.filter(isUnread) : NOTIFICATIONS;
  const unreadCount = NOTIFICATIONS.filter(isUnread).length;

  const markAll = () => setRead(NOTIFICATIONS.map((n) => n.title));

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

        {shown.length ? (
          <div className="dash-notiflist big">
            {shown.map((n) => (
              <div
                className={isUnread(n) ? "dash-notifrow unread" : "dash-notifrow"}
                key={n.title}
              >
                <span className={`dash-notific t-${n.tone}`}>{n.glyph}</span>
                <span className="dash-notifinfo">
                  <b>{n.title}</b>
                  <small>{n.ago}</small>
                </span>
                {isUnread(n) && <i className="dash-unreaddot" />}
              </div>
            ))}
          </div>
        ) : (
          <div className="dash-empty">
            <p>You&apos;re all caught up.</p>
            <span>No unread notifications.</span>
          </div>
        )}
      </section>
    </div>
  );
}
