/**
 * NotificationService — Native OS notifications via Service Worker.
 * Only shows notifications when the app is NOT focused (background/minimized).
 */

const APP_ICON = '/pwa-192x192.png';

/**
 * Request permission for notifications. Call once on app start.
 * @returns {Promise<'granted'|'denied'|'default'>}
 */
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission;
  }

  return Notification.permission;
}

/**
 * Show a native OS notification via the Service Worker.
 * Using SW ensures notifications work even when the tab is not focused.
 */
export async function showNotification(title, body, options = {}) {
  if (Notification.permission !== 'granted') return;

  try {
    const registration = await navigator.serviceWorker?.ready;
    if (registration) {
      await registration.showNotification(title, {
        body,
        icon: APP_ICON,
        badge: APP_ICON,
        tag: options.tag || 'boxmanager-notification',
        renotify: true,
        vibrate: [100, 50, 100],
        data: {
          url: options.url || '/',
          ...options.data,
        },
        ...options,
      });
    }
  } catch (error) {
    console.warn('Failed to show notification:', error);
  }
}

/**
 * Show notification ONLY if the document is not focused.
 * This avoids duplicating the in-app toast when the user is actively using the app.
 */
export function notifyIfBackground(title, body, options = {}) {
  if (document.visibilityState === 'hidden' || !document.hasFocus()) {
    showNotification(title, body, options);
  }
}

/**
 * Check if notifications are supported and permitted.
 */
export function isNotificationEnabled() {
  return 'Notification' in window && Notification.permission === 'granted';
}

// Global set to track our own actions to prevent self-notifications
const recentOwnActions = new Set();

export function markOwnAction(id) {
  if (!id) return;
  recentOwnActions.add(id);
  // Clear the ID after 5 seconds
  setTimeout(() => recentOwnActions.delete(id), 5000);
}

export function isOwnAction(id) {
  return recentOwnActions.has(id);
}
