import { createContextProps } from './LoaderContext';
import { createContext, useContext } from 'react'

export const LoadingContext = createContext<createContextProps | undefined >(undefined);

export const useLoader = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};