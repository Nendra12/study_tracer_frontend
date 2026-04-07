import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

/**
 * Create a Laravel Echo instance configured for Reverb.
 * Call this AFTER user login when you have the auth token.
 */
export function createEcho(authToken) {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

  return new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: import.meta.env.VITE_REVERB_PORT ?? 8080,
    wssPort: import.meta.env.VITE_REVERB_PORT ?? 443,
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
    enabledTransports: ['ws', 'wss'],
    authEndpoint: `${apiUrl}/broadcasting/auth`,
    auth: {
      headers: {
        Authorization: `Bearer ${authToken}`,
        Accept: 'application/json',
      },
    },
  });
}

/**
 * Disconnect and clean up Echo instance.
 */
export function disconnectEcho(echoInstance) {
  if (echoInstance) {
    echoInstance.disconnect();
  }
}
