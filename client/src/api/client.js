import axios from 'axios';
import { scheduleColdStartNotice, clearColdStartNotice } from '../utils/coldStartBanner';

const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const TOKEN_KEY = 'dailytrack_token';

// The frontend (Vercel) and backend (Render) live on different domains, so
// every request here is cross-site from the browser's point of view.
// Cross-site cookies are unreliable in this setup — SameSite=None cookies
// get silently dropped by Safari ITP, Firefox ETP, Brave, and installed/
// standalone PWAs (especially on iOS) even when the server sets them
// correctly. Relying on cookies alone is exactly why "Authentication
// required" / "Failed to load..." errors show up inconsistently.
//
// The backend already returns a JWT in the response body on login/register
// AND accepts it via an `Authorization: Bearer <token>` header (see
// server/src/middlewares/authMiddleware.js) — so we use that as the primary
// auth mechanism and keep the cookie only as a harmless best-effort extra.
export const getAuthToken = () => localStorage.getItem(TOKEN_KEY);
export const setAuthToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearAuthToken = () => localStorage.removeItem(TOKEN_KEY);

const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 60000, // Render free tier can take up to ~50s to wake from sleep
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Free-tier Render backends spin down when idle; the first request after
  // that can take tens of seconds. Warn the user instead of letting it look
  // like a silent freeze/failure.
  scheduleColdStartNotice();
  return config;
});

api.interceptors.response.use(
  (response) => {
    clearColdStartNotice();
    return response.data;
  },
  async (error) => {
    clearColdStartNotice();

    // A 401 means the token is missing/expired/invalid — clear whatever
    // stale token we have so the app doesn't keep retrying with it.
    if (error.response?.status === 401) {
      clearAuthToken();
    }

    // No response at all (network error / timeout) usually means the
    // Render instance was still cold-starting. Retry exactly once after a
    // short delay before surfacing an error to the user.
    const config = error.config || {};
    if (!error.response && !config.__retriedAfterColdStart) {
      config.__retriedAfterColdStart = true;
      await new Promise((resolve) => setTimeout(resolve, 4000));
      scheduleColdStartNotice();
      try {
        const retryResponse = await api(config);
        return retryResponse;
      } catch (retryError) {
        clearColdStartNotice();
        const message =
          retryError.response?.data?.message ||
          'Could not reach the server. It may be waking up from sleep — please try again in a few seconds.';
        return Promise.reject(new Error(message));
      }
    }

    const message =
      error.response?.data?.message || error.message || 'An unexpected error occurred.';
    return Promise.reject(new Error(message));
  }
);

export default api;
