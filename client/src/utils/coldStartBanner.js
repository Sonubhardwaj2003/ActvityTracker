// Render's free tier spins the backend down after inactivity; the first
// request after that can take up to ~50s to respond. That delay can look
// exactly like a broken "failed to load" error if the user isn't told
// what's happening. This is intentionally plain DOM (not a React
// component) so axios interceptors in client.js can call it directly
// without needing access to React context/hooks.

let bannerEl = null;
let showTimer = null;

const BANNER_ID = 'dailytrack-coldstart-banner';

const createBanner = () => {
  const el = document.createElement('div');
  el.id = BANNER_ID;
  el.setAttribute('role', 'status');
  el.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px 16px;
    padding-top: max(10px, env(safe-area-inset-top, 0px));
    background: linear-gradient(90deg, #0369a1, #38bdf8);
    color: white;
    font: 600 12px/1.4 Inter, system-ui, -apple-system, sans-serif;
    text-align: center;
    box-shadow: 0 2px 12px rgba(0,0,0,0.25);
    transform: translateY(-100%);
    transition: transform 0.25s ease;
  `;
  el.innerHTML = `
    <span style="
      width:12px;height:12px;border-radius:50%;
      border:2px solid rgba(255,255,255,0.4);
      border-top-color:#fff;
      display:inline-block;
      animation: dailytrack-spin 0.8s linear infinite;
    "></span>
    <span>Waking up the server — first request can take up to 50s on our free hosting tier.</span>
  `;
  if (!document.getElementById('dailytrack-coldstart-style')) {
    const style = document.createElement('style');
    style.id = 'dailytrack-coldstart-style';
    style.textContent = `@keyframes dailytrack-spin { to { transform: rotate(360deg); } }`;
    document.head.appendChild(style);
  }
  document.body.appendChild(el);
  requestAnimationFrame(() => {
    el.style.transform = 'translateY(0)';
  });
  return el;
};

/** Call when a request starts. Shows the banner only if it's still pending after 3.5s. */
export const scheduleColdStartNotice = () => {
  clearTimeout(showTimer);
  showTimer = setTimeout(() => {
    if (!bannerEl) bannerEl = createBanner();
  }, 3500);
};

/** Call when a request settles (success or error). Cancels/hides the banner. */
export const clearColdStartNotice = () => {
  clearTimeout(showTimer);
  if (bannerEl) {
    bannerEl.style.transform = 'translateY(-100%)';
    const el = bannerEl;
    bannerEl = null;
    setTimeout(() => el.remove(), 250);
  }
};
