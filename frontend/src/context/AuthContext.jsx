import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const DEMO_ACCOUNTS = [
  {
    role: 'patient',
    label: 'Patient A (John Doe)',
    patientId: 'P1001',
    username: 'patientA',
    password: 'Password123!',
    tag: 'Owns P1001 records',
  },
  {
    role: 'patient',
    label: 'Patient B (Jane Smith)',
    patientId: 'P1002',
    username: 'patientB',
    password: 'Password123!',
    tag: 'Owns P1002 records',
  },
  {
    role: 'patient',
    label: 'Patient C (Robert Brown)',
    patientId: 'P1003',
    username: 'patientC',
    password: 'Password123!',
    tag: 'Owns P1003 records',
  },
  {
    role: 'doctor',
    label: 'Dr. Alice Carter (D201)',
    doctorId: 'D201',
    username: 'dr_alice',
    password: 'DoctorPass123!',
    tag: 'Assigned to P1001 & P1003',
  },
  {
    role: 'doctor',
    label: 'Dr. Bob Vance (D202)',
    doctorId: 'D202',
    username: 'dr_bob',
    password: 'DoctorPass123!',
    tag: 'Assigned to P1002',
  },
  {
    role: 'admin',
    label: 'System Admin (Sarah)',
    username: 'admin',
    password: 'AdminPass123!',
    tag: 'Full Access & Testing Dashboard',
  },
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('health_token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize from existing token
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('health_token');
      if (storedToken) {
        try {
          const res = await authAPI.getMe();
          setUser(res.data);
        } catch (err) {
          console.warn('Session expired or token invalid, resetting auth');
          localStorage.removeItem('health_token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (username, password) => {
    const res = await authAPI.login(username, password);
    const { token: newToken, user: userData } = res.data;
    localStorage.setItem('health_token', newToken);
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const register = async (userData) => {
    const res = await authAPI.register(userData);
    const { token: newToken, user: newUser } = res.data;
    localStorage.setItem('health_token', newToken);
    setToken(newToken);
    setUser(newUser);
    return newUser;
  };

  const logout = async () => {
    try {
      if (token) {
        await authAPI.logout();
      }
    } catch (err) {
      console.warn('Logout notification error:', err);
    } finally {
      localStorage.removeItem('health_token');
      setToken(null);
      setUser(null);
    }
  };

  const quickSwitch = async (demoAccount) => {
    return await login(demoAccount.username, demoAccount.password);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        role: user?.role || 'guest',
        patientId: user?.patientId || null,
        doctorId: user?.doctorId || null,
        login,
        register,
        logout,
        quickSwitch,
        demoAccounts: DEMO_ACCOUNTS,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
