import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

/**
 * Create a Laravel Echo instance configured for Reverb.
 * Call this AFTER user login when you have the auth token.
 */
export function createEcho(authToken) {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
  const browserHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  const rawHost = import.meta.env.VITE_REVERB_HOST || browserHost;
  const wsHost = (rawHost === 'localhost' && browserHost !== 'localhost' && browserHost !== '127.0.0.1')
    ? browserHost
    : rawHost;
  const wsPort = Number(import.meta.env.VITE_REVERB_PORT ?? 8080);
  const wssPort = Number(import.meta.env.VITE_REVERB_PORT ?? 443);
  const forceTLS = (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https';

  return new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost,
    wsPort,
    wssPort,
    forceTLS,
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
