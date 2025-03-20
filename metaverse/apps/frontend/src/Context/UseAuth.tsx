import { createContext, useContext } from "react";
import { AuthContextType } from "./authContext";

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};