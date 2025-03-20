import React, { useState, ReactNode } from 'react';

export interface AuthContextType {
  isLogin: boolean;
  accessToken: string | null,
  SetAccessToken: (accesstoken: string) => void;
  logout: () => void;
}

import { AuthContext } from './UseAuth';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLogin, setIsLogin] = useState<boolean>(false);
  const [accessToken, setAccessToken] = useState<string|null>(null);
  const [tokenTimeout, setTokenTimeout] = useState<NodeJS.Timeout | null>(null);

  const login = () => setIsLogin(true);
  const logout = () => {
    setIsLogin(false);
    setAccessToken(null)
    if (tokenTimeout) clearTimeout(tokenTimeout);
  }
  
  const SetAccessToken = (accesstoken: string, expiryTime: number = 15 * 60 * 1000) => {
    setAccessToken(accesstoken);
    login();

    if (tokenTimeout) clearTimeout(tokenTimeout);

    const timeout = setTimeout(() => {
      logout();
    }, expiryTime);

    setTokenTimeout(timeout);
  }

  return (
    <AuthContext.Provider value={{ isLogin, accessToken, SetAccessToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
};