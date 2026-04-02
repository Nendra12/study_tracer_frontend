import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * Hook untuk auto-logout saat user tidak aktif selama durasi tertentu.
 * 
 * Cara kerja:
 * - Track aktivitas user (mouse, keyboard, click, scroll, touch)
 * - Reset timer setiap ada aktivitas
 * - Tampilkan warning 5 menit sebelum timeout
 * - Auto-logout saat timeout habis
 * 
 * @param {number} timeoutMs - Durasi inactivity sebelum logout (default: 5 jam = 18000000ms)
 * @param {number} warningMs - Durasi warning sebelum timeout (default: 5 menit = 300000ms)
 */
export default function useInactivityTimeout(
  timeoutMs = 5 * 60 * 60 * 1000,   // 5 jam
  warningMs = 5 * 60 * 1000          // 5 menit sebelum timeout
) {
  const { isAuthenticated, logout } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  const timeoutRef = useRef(null);
  const warningRef = useRef(null);
  const countdownRef = useRef(null);

  // Simpan timestamp aktivitas terakhir ke localStorage (sync antar tab)
  const updateLastActivity = useCallback(() => {
    localStorage.setItem('last_activity', Date.now().toString());
  }, []);

  // Clear semua timers
  const clearAllTimers = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);

    timeoutRef.current = null;
    warningRef.current = null;
    countdownRef.current = null;
  }, []);

  // Handle logout karena inaktif
  const handleInactivityLogout = useCallback(async () => {
    clearAllTimers();
    setShowWarning(false);
    localStorage.setItem('session_expired_reason', 'Sesi Anda telah berakhir karena tidak aktif selama lebih dari 5 jam. Silakan login kembali.');
    localStorage.removeItem('last_activity');
    
    await logout();
    window.location.href = '/login';
  }, [logout, clearAllTimers]);

  // Start/Reset timer
  const resetTimers = useCallback(() => {
    if (!isAuthenticated) return;

    clearAllTimers();
    setShowWarning(false);
    updateLastActivity();

    // Set warning timer (muncul 5 menit sebelum timeout)
    const warningDelay = timeoutMs - warningMs;

    warningRef.current = setTimeout(() => {
      setShowWarning(true);
      setRemainingSeconds(Math.floor(warningMs / 1000));

      // Start countdown
      countdownRef.current = setInterval(() => {
        setRemainingSeconds(prev => {
          if (prev <= 1) {
            clearInterval(countdownRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, warningDelay);

    // Set logout timer
    timeoutRef.current = setTimeout(() => {
      handleInactivityLogout();
    }, timeoutMs);
  }, [isAuthenticated, timeoutMs, warningMs, clearAllTimers, updateLastActivity, handleInactivityLogout]);

  // Extend session (user klik "Lanjutkan" di warning modal)
  const extendSession = useCallback(() => {
    resetTimers();
  }, [resetTimers]);

  // Dismiss warning (tutup warning tapi timer tetap jalan)
  const dismissWarning = useCallback(() => {
    setShowWarning(false);
  }, []);

  // Setup event listeners dan timers
  useEffect(() => {
    if (!isAuthenticated) {
      clearAllTimers();
      setShowWarning(false);
      return;
    }

    // Cek apakah sudah expired saat page load (berdasarkan last_activity di localStorage)
    const lastActivity = localStorage.getItem('last_activity');
    if (lastActivity) {
      const elapsed = Date.now() - parseInt(lastActivity, 10);
      if (elapsed >= timeoutMs) {
        handleInactivityLogout();
        return;
      }
    }

    // Activity events yang di-track
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'];

    // Throttle handler agar tidak terlalu sering reset (1 detik cooldown)
    let lastReset = 0;
    const handleActivity = () => {
      const now = Date.now();
      if (now - lastReset < 1000) return; // Throttle 1 detik
      lastReset = now;
      resetTimers();
    };

    // Register event listeners
    events.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Sync antar tab via storage event
    const handleStorageChange = (e) => {
      if (e.key === 'last_activity' && e.newValue) {
        resetTimers();
      }
      // Jika tab lain logout
      if (e.key === 'auth_token' && !e.newValue) {
        clearAllTimers();
        setShowWarning(false);
        window.location.href = '/login';
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // Start initial timer
    resetTimers();

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      window.removeEventListener('storage', handleStorageChange);
      clearAllTimers();
    };
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    showWarning,
    remainingSeconds,
    extendSession,
    dismissWarning,
  };
}
