// helper: utils/jwt.js
export function getTokenExpiry(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp ? payload.exp * 1000 : null; // ms
  } catch (e) {
    return null;
  }
}

export function scheduleTokenRefresh(authStore, bufferSeconds = 60) {
  const token = localStorage.getItem("access_token");
  const expiryMs = token ? getTokenExpiry(token) : null;
  if (!expiryMs) return;

  const now = Date.now();
  const refreshAt = expiryMs - bufferSeconds * 1000; // when to refresh
  const delay = Math.max(refreshAt - now, 0);

  setTimeout(async () => {
    try {
      await authStore.refreshToken();
      // reschedule again
      scheduleTokenRefresh(authStore, bufferSeconds);
    } catch (e) {
      // refresh failed -> store.logout already called
    }
  }, delay);
}
