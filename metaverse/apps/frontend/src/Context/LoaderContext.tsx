import React, { useState } from 'react';
import { LoadingContext } from './UseLoader';

export interface createContextProps {
    loading: boolean,
    showLoader: () => void;
    hideLoader: () => void;
}
export const LoaderProvider = ({ children }: {children: React.ReactNode}) => {
  const [loading, setLoading] = useState<boolean>(false);

  const showLoader = () => setLoading(true);
  const hideLoader = () => setLoading(false);

  return (
    <LoadingContext.Provider value={{ loading, showLoader, hideLoader }}>
      {children}
    </LoadingContext.Provider>
  );
};
