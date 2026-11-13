import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import rightarrow from "../assets/right-arrow.png";
import { api, ago, uploadImage } from "../Api";

const CATEGORIES = ["Personal", "Academic", "Electronics", "Other"];

// the form behind the "I Lost Something" / "I Found Something" banner buttons.
// image optional, description + contact number required, name optional.
export default function PostItem() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const kind = params.get("kind") === "lost" ? "Lost" : "Found";

  const [form, setForm] = useState({
    title: "",
    desc: "",
    category: "",
    location: "",
    contactPhone: "",
    contactName: "",
  });
  const [file, setFile] = useState(null); // { file, url }
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // a lost-reporter should scan FOUND posts (maybe someone has it), and a
  // finder should scan LOST posts (looking for its owner) — show the opposite
  // kind beside the form so a match is spotted before/while posting
  const opposite = kind === "Lost" ? "Found" : "Lost";
  const [matches, setMatches] = useState(null); // null = still loading

  useEffect(() => {
    let alive = true;
    api("/items")
      .then((j) =>
        alive && setMatches(j.items.filter((i) => i.kind === opposite))
      )
      .catch(() => alive && setMatches([]));
    return () => {
      alive = false;
    };
  }, [opposite]);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const pickImage = (e) => {
    const picked = e.target.files?.[0];
    e.target.value = ""; // allow re-picking
    if (!picked) return;
    if (!picked.type.startsWith("image/")) return setError("Images only, please.");
    if (picked.size > 3 * 1024 * 1024)
      return setError("That image is larger than 3 MB.");
    setError("");
    setFile({ file: picked, url: URL.createObjectURL(picked) });
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      let image;
      if (file) image = await uploadImage(file.file);
      const json = await api("/items", {
        method: "POST",
        body: { kind, ...form, image },
      });
      navigate(`/dashboard/lost-found/${json.item._id}`);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="dash-page">
      <div className="dash-crumbs">
        <Link to="/dashboard/lost-found">← Lost &amp; Found</Link>
        <i>›</i>
        <span>{kind === "Lost" ? "Report Lost Item" : "Report Found Item"}</span>
      </div>

      <div className="dash-twoCol">
        <form className="dash-maincol" onSubmit={submit}>
          <section className="dash-card">
            <div className="dash-cardhead">
              <h2>
                {kind === "Lost" ? "Report a Lost Item" : "Report a Found Item"}{" "}
                <span className={`dash-pill ${kind === "Lost" ? "p-high" : "p-low"}`}>
                  {kind}
                </span>
              </h2>
            </div>

            <label className="dash-field">
              <span>Title (optional)</span>
              <input
                type="text"
                value={form.title}
                onChange={set("title")}
                placeholder={kind === "Lost" ? "e.g. Black wallet" : "e.g. Blue water bottle"}
              />
            </label>

            <label className="dash-field">
              <span>Description</span>
              <textarea
                rows={4}
                value={form.desc}
                onChange={set("desc")}
                placeholder={
                  kind === "Lost"
                    ? "What did you lose, what does it look like, where and when did you last see it?"
                    : "What did you find, what does it look like, where and when did you find it?"
                }
                required
              />
            </label>

            <div className="dash-field">
              <span>Category</span>
              <div className="dash-chips">
                {CATEGORIES.map((c) => (
                  <button
                    type="button"
                    key={c}
                    className={form.category === c ? "dash-chip on" : "dash-chip"}
                    onClick={() => setForm({ ...form, category: c })}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <label className="dash-field">
              <span>Location</span>
              <input
                type="text"
                value={form.location}
                onChange={set("location")}
                placeholder={kind === "Lost" ? "Where did you lose it?" : "Where did you find it?"}
              />
            </label>

            <div className="dash-field">
              <span>Photo (optional)</span>
              <label className="dash-dropzone" title="Choose a photo">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  hidden
                  onChange={pickImage}
                />
                {file ? (
                  <span className="dz-preview">
                    <img src={file.url} alt="" />
                    <b>Change photo</b>
                  </span>
                ) : (
                  <>
                    <b>+</b>
                    <span>Click to add a photo (max 3 MB)</span>
                  </>
                )}
              </label>
            </div>

            <label className="dash-field">
              <span>Contact number (optional)</span>
              <input
                type="tel"
                value={form.contactPhone}
                onChange={set("contactPhone")}
                placeholder="e.g. +92 300 1234567 — or leave empty and use chat"
              />
              <small className="detail-nophotos">
                Optional — and private either way: only revealed to people you
                chat with about this item. Chat alone is enough to connect.
              </small>
            </label>

            <label className="dash-field">
              <span>Your name (optional)</span>
              <input
                type="text"
                value={form.contactName}
                onChange={set("contactName")}
                placeholder="Shown only in accepted chats"
              />
            </label>

            {error && <p className="detail-nophotos">{error}</p>}

            <button className="dash-btn dash-submit" type="submit" disabled={submitting}>
              {submitting ? "Posting…" : kind === "Lost" ? "Post Lost Item" : "Post Found Item"}{" "}
              <img src={rightarrow} alt="" />
            </button>
          </section>
        </form>

        <aside className="dash-rail">
          <section className="dash-card">
            <div className="dash-cardhead">
              <h2>
                {opposite === "Found"
                  ? "Found items — someone may have yours"
                  : "Lost items — maybe its owner is here"}
              </h2>
              <Link
                className="dash-viewall"
                to={`/dashboard/lost-found?kind=${opposite.toLowerCase()}`}
              >
                View All <img src={rightarrow} alt="" />
              </Link>
            </div>
            {matches === null ? (
              <p className="detail-nophotos">Loading…</p>
            ) : matches.length ? (
              <div className="dash-notiflist">
                {matches.slice(0, 6).map((i) => (
                  <Link className="dash-notifrow" to={`/dashboard/lost-found/${i._id}`} key={i._id}>
                    <span className={`dash-notific ${i.kind === "Lost" ? "t-amber" : "t-green"}`}>
                      {i.kind === "Lost" ? "!" : "✓"}
                    </span>
                    <span className="dash-notifinfo">
                      <b>{i.title || i.desc.slice(0, 42)}</b>
                      <small>
                        📍 {i.location || "—"} · {ago(i.createdAt)}
                      </small>
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="dash-empty">
                <p>No {opposite.toLowerCase()} items yet.</p>
                <span>Post yours anyway — the next person will see it here.</span>
              </div>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
