// Service worker registration for the public site.
// Admin panel intentionally does NOT register the SW to prevent editors
// from seeing stale API data.
//
// Uses `registerType: 'prompt'` — when a new SW is ready, we ask the user
// to reload. Today it's a simple confirm() dialog; can be upgraded to a
// snackbar UI later without changing the SW contract.
import { registerSW } from 'virtual:pwa-register';

if (typeof window !== 'undefined') {
    const updateSW = registerSW({
        onNeedRefresh() {
            // New content is ready. Ask the user to refresh.
            // eslint-disable-next-line no-alert
            if (window.confirm('A new version is available. Reload now?')) {
                updateSW(true);
            }
        },
        onOfflineReady() {
            // First install — the app now works offline.
            // No user-facing message needed; log for debugging.
            // eslint-disable-next-line no-console
            console.info('[PWA] App ready to work offline.');
        },
    });
}
