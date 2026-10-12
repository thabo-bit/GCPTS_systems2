// src/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';

export interface AuthUser {
  id: number;                        // ⭐ ADDED — required for notifications
  email: string;
  fullName: string;
  userType: 'admin' | 'user';
  token: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  isReady: boolean;
  login: (data: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoggedIn: false,
  isAdmin: false,
  isReady: false,
  login: () => {},
  logout: () => {},
});

const STORAGE_KEY = 'gcpts_auth';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        // 🔒 Backwards-compat: if old data had no id, log them out so they re-login
        if (parsed && typeof parsed.id === 'number') {
          setUser(parsed);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsReady(true);
  }, []);

  const login = (data: AuthUser) => {
    const authData: AuthUser = {
      id: data.id,                   // ⭐ CRITICAL — flows through from LoginPage
      email: data.email,
      fullName: data.fullName,
      userType: data.userType,
      token: data.token,
    };
    setUser(authData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        isAdmin: user?.userType === 'admin',
        isReady,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);