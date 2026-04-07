import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { authApi } from '../api/auth';
import { createEcho, disconnectEcho } from '../utils/echo';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('auth_token'));
  const [loading, setLoading] = useState(true);
  const echoRef = useRef(null);

  const persistUser = useCallback((userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  }, []);


  // Fetch current user on mount if token exists
  useEffect(() => {
    if (token) {
      authApi.me()
        .then((res) => {
          const userData = res.data.data;
          persistUser(userData);
        })
        .catch(() => {
          // Token invalid — clear auth
          setToken(null);
          setUser(null);
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token, persistUser]);

  const login = useCallback(async (credentials) => {
    const res = await authApi.login(credentials);
    const { token: newToken, user: userData } = res.data.data;
    setToken(newToken);
    persistUser(userData);

    localStorage.setItem('auth_token', newToken);
    localStorage.setItem('last_activity', Date.now().toString());
    localStorage.removeItem('session_expired_reason');
    return userData;
  }, [persistUser]);

  const register = useCallback(async (formData) => {
    const res = await authApi.register(formData);
    const newToken = res.data.data.token;
    setToken(newToken);
    localStorage.setItem('auth_token', newToken);

    // Fetch full user info after registration
    const meRes = await authApi.me();
    const userData = meRes.data.data;
    persistUser(userData);
    return userData;
  }, [persistUser]);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore errors on logout
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      localStorage.removeItem('last_activity');
    }
  }, []);

  const refreshUser = useCallback(async () => {
    if (!token) return;
    try {
      const res = await authApi.me();
      const userData = res.data.data;
      persistUser(userData);
      return userData;
    } catch (err) {
      console.error('Failed to refresh user:', err);
      throw err;
    }
  }, [token, persistUser]);

  // Setup Echo connection saat login berhasil
  useEffect(() => {
    if (!token || !user) {
      disconnectEcho(echoRef.current);
      echoRef.current = null;
      return;
    }

    const authUserId = user.id_users || user.id;
    if (!authUserId) return;

    // Recreate to ensure fresh auth headers after token/user changes.
    disconnectEcho(echoRef.current);
    echoRef.current = createEcho(token);

    const userChannel = echoRef.current.private(`user.${authUserId}`);

    userChannel.listen('.notification.received', (data) => {
      console.log('🔔 New notification:', data.notification);
      window.dispatchEvent(new CustomEvent('reverb:notification.received', { detail: data }));
    });

    userChannel.listen('.kuesioner.updated', () => {
      window.dispatchEvent(new CustomEvent('reverb:kuesioner.updated'));
      refreshUser();
    });

    userChannel.listen('.access.lock-changed', (data) => {
      window.dispatchEvent(new CustomEvent('reverb:access.lock-changed', { detail: data }));
      setUser((prev) => {
        if (!prev) return prev;
        const updated = { ...prev, can_access_all: data.can_access_all };
        localStorage.setItem('user', JSON.stringify(updated));
        return updated;
      });
    });

    userChannel.listen('.account.status-changed', (data) => {
      window.dispatchEvent(new CustomEvent('reverb:account.status-changed', { detail: data }));
      if (data.status === 'banned') {
        logout();
      } else {
        refreshUser();
      }
    });

    userChannel.listen('.lowongan.status-changed', (data) => {
      window.dispatchEvent(new CustomEvent('reverb:lowongan.status-changed', { detail: data }));
    });

    let alumniChannel = null;
    let adminChannel = null;

    if (user.role === 'alumni') {
      alumniChannel = echoRef.current.private('alumni');
      alumniChannel.listen('.pengumuman.created', (data) => {
        window.dispatchEvent(new CustomEvent('reverb:pengumuman.created', { detail: data }));
      });
    }

    if (user.role === 'admin') {
      adminChannel = echoRef.current.private('admin');
      adminChannel.listen('.dashboard.stats-updated', (data) => {
        window.dispatchEvent(new CustomEvent('reverb:dashboard.stats-updated', { detail: data }));
      });
    }

    return () => {
      if (echoRef.current && authUserId) {
        echoRef.current.leave(`private-user.${authUserId}`);
      }
      if (echoRef.current && user.role === 'alumni') {
        echoRef.current.leave('private-alumni');
      }
      if (echoRef.current && user.role === 'admin') {
        echoRef.current.leave('private-admin');
      }
      disconnectEcho(echoRef.current);
      echoRef.current = null;
    };
  }, [token, user?.id_users, user?.id, user?.role, refreshUser, logout]);

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === 'admin',
    isAlumni: user?.role === 'alumni',
    echo: echoRef.current,
    login,
    register,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
