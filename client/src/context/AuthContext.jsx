import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/authApi';
import { getAuthToken, setAuthToken, clearAuthToken } from '../api/client';
import { useToast } from './ToastContext';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { success, error } = useToast();

  const fetchCurrentUser = useCallback(async () => {
    // No token stored means we were never logged in on this device/browser —
    // skip the network round trip and land straight on the welcome page.
    if (!getAuthToken()) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await authApi.getMe();
      if (res.success && res.user) {
        setUser(res.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = async (email, password) => {
    try {
      const res = await authApi.login({ email, password });
      if (res.success && res.user) {
        if (res.token) setAuthToken(res.token);
        setUser(res.user);
        success(`Welcome back, ${res.user.name}!`);
        return { success: true };
      }
    } catch (err) {
      error(err.message || 'Login failed. Please check credentials.');
      return { success: false, error: err.message };
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await authApi.register({ name, email, password });
      if (res.success && res.user) {
        if (res.token) setAuthToken(res.token);
        setUser(res.user);
        success(`Account created! Welcome to DailyTrack, ${res.user.name}.`);
        return { success: true };
      }
    } catch (err) {
      error(err.message || 'Registration failed.');
      return { success: false, error: err.message };
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      // ignore — we're clearing local state regardless
    } finally {
      clearAuthToken();
      setUser(null);
      success('Logged out successfully.');
    }
  };

  const updatePreferences = async (prefs) => {
    try {
      const res = await authApi.updatePreferences(prefs);
      if (res.success && res.preferences) {
        setUser((prev) => ({ ...prev, preferences: res.preferences }));
        success('Preferences updated.');
      }
    } catch (err) {
      error(err.message || 'Failed to update preferences.');
    }
  };

  const updateProfile = async (data) => {
    try {
      const res = await authApi.updateProfile(data);
      if (res.success && res.user) {
        setUser((prev) => ({ ...prev, ...res.user }));
        success('Profile updated successfully.');
        return { success: true };
      }
    } catch (err) {
      error(err.message || 'Failed to update profile.');
      return { success: false, error: err.message };
    }
  };

  const seedDemo = async () => {
    try {
      const res = await authApi.seedDemo();
      if (res.success) {
        success(res.message);
        await fetchCurrentUser();
        return { success: true };
      }
    } catch (err) {
      error(err.message || 'Failed to load demo dataset.');
      return { success: false };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updatePreferences,
        updateProfile,
        refreshUser: fetchCurrentUser,
        seedDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
