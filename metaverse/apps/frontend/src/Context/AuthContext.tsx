import React, { useState, ReactNode } from 'react';
import { AuthContext } from './UseAuth';
import { axios } from '../Axios/axios';
import { config } from '../config';

export interface AuthContextType {
  userId: string | null,
  isLogin: boolean;
  accessToken: string | null,
  SetAccessToken: (accesstoken: string, expiryTime: number, userId:string) => void;
  logout: () => Promise<void>;
  removeAccessToken: () => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLogin, setIsLogin] = useState<boolean>(false);
  const [accessToken, setAccessToken] = useState<string|null>(null);
  const [tokenTimeout, setTokenTimeout] = useState<NodeJS.Timeout | null>(null);
  const [userId, setUserId] = useState<string|null>(null);

  const login = () => setIsLogin(true);
  const logout = async() => {
    try {
      await axios.post(`${config.BackendUrl}/signout`, {}, {
        withCredentials: true
      });
      setIsLogin(false);
      setAccessToken(null);
      setUserId(null);
      if (tokenTimeout) clearTimeout(tokenTimeout);
    } catch (error) {
      console.error(error);
    }
  }
  const removeAccessToken = () => {
    setAccessToken(null);
  }
  
  const SetAccessToken = (accesstoken: string, expiryTime: number = 15 * 60 * 1000, userId: string) => {
    setAccessToken(accesstoken);
    setUserId(userId);
    login();

    if (tokenTimeout) clearTimeout(tokenTimeout);

    const timeout = setTimeout(() => {
      removeAccessToken();
    }, expiryTime);

    setTokenTimeout(timeout);
  }

  return (
    <AuthContext.Provider value={{ isLogin, accessToken, SetAccessToken, logout, removeAccessToken, userId }}>
      {children}
    </AuthContext.Provider>
  );
};