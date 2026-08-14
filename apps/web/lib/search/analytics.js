const API = process.env.NEXT_PUBLIC_API_URL;
const identifier = (key, session = false) => { const store = session ? sessionStorage : localStorage; let value = store.getItem(key); if (!value) { value = crypto.randomUUID(); store.setItem(key, value); } return value; };
export function trackSearch(event) {
  if (!API || navigator.doNotTrack === "1") return;
  fetch(`${API}/analytics/track`, { method: "POST", headers: { "Content-Type": "application/json" }, keepalive: true,
    body: JSON.stringify({ path: location.pathname, visitorId: identifier("asif_visitor_id"), sessionId: identifier("asif_session_id", true), referrer: document.referrer,
      device: innerWidth < 768 ? "mobile" : innerWidth < 1024 ? "tablet" : "desktop", event }) }).catch(() => {});
}
