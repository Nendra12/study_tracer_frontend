import { useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * Reusable helper hook for Laravel Echo subscriptions.
 * Echo lifecycle is managed centrally in AuthContext.
 */
export function useEcho() {
  const { echo } = useAuth();

  // Subscribe to a private channel and return an unsubscribe callback.
  const subscribePrivate = useCallback((channelName, eventName, callback) => {
    if (!echo) return null;

    const fullEventName = eventName.startsWith('.') ? eventName : `.${eventName}`;
    const channel = echo.private(channelName);
    channel.listen(fullEventName, callback);

    return () => {
      channel.stopListening(fullEventName);
    };
  }, [echo]);

  return {
    echo,
    subscribePrivate,
  };
}
