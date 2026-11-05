import { useEffect, useState } from "react";
import { API_URL } from "../Api";

// A plain <img src> can't send our Authorization header, so photos are fetched
// as authenticated blobs and rendered from object URLs (revoked on unmount).
// With no id — or on load failure — it falls back to the .dash-photo placeholder.
export default function AuthImg({ id, className = "", alt = "" }) {
  const [src, setSrc] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!id) return undefined;
    let url = null;
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`${API_URL}/images/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (!res.ok) throw new Error("image fetch failed");
        const blob = await res.blob();
        if (!alive) return;
        url = URL.createObjectURL(blob);
        setSrc(url);
      } catch {
        if (alive) setFailed(true);
      }
    })();
    return () => {
      alive = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [id]);

  if (!id || failed || !src) {
    return <span className={`dash-photo ${className}`} aria-hidden="true" />;
  }
  return <img className={`authimg ${className}`} src={src} alt={alt} />;
}
