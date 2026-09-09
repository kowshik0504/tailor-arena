import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/lib/api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'tailor' | 'customer' | 'admin';
  token?: string;
  location?: {
    street: string;
    area?: string;
    city: string;
    pincode: string;
    latitude?: number;
    longitude?: number;
  };
  shopName?: string;
  phone?: string;
  gstin?: string;
  established?: string;
  preferences?: {
    emailNotifications: boolean;
    whatsappUpdates: boolean;
    smsReminders: boolean;
    twoFactorAuth: boolean;
  };
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<any>;
  verify2FALogin: (email: string, otp: string, trustDevice: boolean) => Promise<User>;
  updatePreferences: (prefs: Partial<User['preferences']>) => Promise<void>;
  register: (name: string, email: string, password: string, role: string) => Promise<User>;
  sendOtp: (name: string, email: string, password: string, role: string) => Promise<void>;
  verifyOtp: (email: string, otp: string) => Promise<User>;
  forgotPassword: (email: string) => Promise<void>;
  verifyResetOtp: (email: string, otp: string) => Promise<void>;
  resetPassword: (email: string, newPassword: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem('tailorarena_user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    let deviceId = localStorage.getItem('tailorarena_device_id');
    if (!deviceId) {
      deviceId = Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem('tailorarena_device_id', deviceId);
    }
    const { data } = await api.post('/auth/login', { email, password, deviceId });
    if (data.require2FA) {
      return data;
    }
    sessionStorage.setItem('tailorarena_user', JSON.stringify(data));
    sessionStorage.setItem('tailorarena_token', data.token);
    setUser(data);
    return data;
  };

  const verify2FALogin = async (email: string, otp: string, trustDevice: boolean) => {
    const deviceId = localStorage.getItem('tailorarena_device_id');
    const { data } = await api.post('/auth/verify-2fa', { email, otp, deviceId, trustDevice });
    sessionStorage.setItem('tailorarena_user', JSON.stringify(data));
    sessionStorage.setItem('tailorarena_token', data.token);
    setUser(data);
    return data;
  };

  const updatePreferences = async (prefs: Partial<User['preferences']>) => {
    const { data } = await api.put('/auth/preferences', prefs);
    if (user) {
      const updatedUser = { ...user, preferences: data.preferences };
      sessionStorage.setItem('tailorarena_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
  };

  const register = async (name: string, email: string, password: string, role: string) => {
    const { data } = await api.post('/auth/register', { name, email, password, role });
    sessionStorage.setItem('tailorarena_user', JSON.stringify(data));
    sessionStorage.setItem('tailorarena_token', data.token);
    setUser(data);
    return data;
  };

  const sendOtp = async (name: string, email: string, password: string, role: string) => {
    await api.post('/auth/send-otp', { name, email, password, role });
  };

  const verifyOtp = async (email: string, otp: string) => {
    const { data } = await api.post('/auth/verify-otp', { email, otp });
    sessionStorage.setItem('tailorarena_user', JSON.stringify(data));
    sessionStorage.setItem('tailorarena_token', data.token);
    setUser(data);
    return data;
  };

  const forgotPassword = async (email: string) => {
    await api.post('/auth/forgot-password', { email });
  };

  const verifyResetOtp = async (email: string, otp: string) => {
    await api.post('/auth/verify-reset-otp', { email, otp });
  };

  const resetPassword = async (email: string, newPassword: string) => {
    await api.post('/auth/reset-password', { email, newPassword });
  };

  const logout = () => {
    sessionStorage.removeItem('tailorarena_user');
    sessionStorage.removeItem('tailorarena_token');
    localStorage.removeItem('onboard_step');
    localStorage.removeItem('onboard_workType');
    localStorage.removeItem('onboard_shopName');
    localStorage.removeItem('onboard_established');
    localStorage.removeItem('onboard_address');
    localStorage.removeItem('onboard_gstin');
    localStorage.removeItem('onboard_contact');
    // Clear out any other residual items to ensure clean state
    localStorage.removeItem('orders_board');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, setUser, login, verify2FALogin, updatePreferences, register, sendOtp, verifyOtp, 
      forgotPassword, verifyResetOtp, resetPassword, 
      logout, loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}



