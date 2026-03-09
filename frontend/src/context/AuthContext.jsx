import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, supabase } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('petmart_user')); } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    const token = localStorage.getItem('petmart_token');
    if (!token) { setLoading(false); return; }
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.data.user);
      localStorage.setItem('petmart_user', JSON.stringify(data.data.user));
    } catch {
      localStorage.removeItem('petmart_token');
      localStorage.removeItem('petmart_user');
      setUser(null);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    // Listen for Supabase auth changes (Google OAuth + Magic Link)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Save supabase token so axios interceptor sends it
        localStorage.setItem('petmart_token', session.access_token);
        localStorage.setItem('petmart_user', JSON.stringify(session.user));
        setUser(session.user);
        setLoading(false);
      } else if (event === 'TOKEN_REFRESHED' && session) {
        // Keep token fresh
        localStorage.setItem('petmart_token', session.access_token);
      } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem('petmart_token');
        localStorage.removeItem('petmart_user');
        setUser(null);
        setLoading(false);
      }
    });

    // Also check localStorage token on first load
    fetchMe();

    return () => subscription.unsubscribe();
  }, [fetchMe]);

  const login = (userData, token) => {
    localStorage.setItem('petmart_token', token);
    localStorage.setItem('petmart_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
      await supabase.auth.signOut();
    } catch {}
    localStorage.removeItem('petmart_token');
    localStorage.removeItem('petmart_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
