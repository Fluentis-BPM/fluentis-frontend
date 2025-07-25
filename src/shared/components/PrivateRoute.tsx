import { RootState } from '@/store';
import React from 'react'
import { useSelector } from "react-redux";
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ element }: { element: React.ReactElement }) => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const status = useSelector((state: RootState) => state.auth.status);

  // Show loading while verifying authentication
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? element : <Navigate to="/auth/login" />;
};

export default PrivateRoute