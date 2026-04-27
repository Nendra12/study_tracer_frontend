import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

/**
 * Create a Laravel Echo instance configured for Reverb.
 * Call this AFTER user login when you have the auth token.
 */
export function createEcho(authToken) {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
  const parsedApiUrl = new URL(apiUrl);
  const browserHost = typeof window !== 'undefined' ? window.location.hostname : parsedApiUrl.hostname;
  const rawHost = import.meta.env.VITE_REVERB_HOST || parsedApiUrl.hostname || browserHost;
  const wsHost = (rawHost === 'localhost' && browserHost !== 'localhost' && browserHost !== '127.0.0.1')
    ? browserHost
    : rawHost;
  const reverbScheme = import.meta.env.VITE_REVERB_SCHEME || parsedApiUrl.protocol.replace(':', '') || 'http';
  const forceTLS = reverbScheme === 'https';

  const envPort = Number(import.meta.env.VITE_REVERB_PORT);
  const fallbackPort = Number(parsedApiUrl.port) || (forceTLS ? 443 : 80);
  const resolvedPort = Number.isFinite(envPort) && envPort > 0 ? envPort : fallbackPort;

  const wsPort = resolvedPort;
  const wssPort = resolvedPort;

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
