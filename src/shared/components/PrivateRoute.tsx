import { RootState } from '@/store';
import React from 'react'
import { useSelector } from "react-redux";
import { Navigate } from 'react-router';

const PrivateRoute = ({ element }: { element: React.ReactElement }) => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  return isAuthenticated ? element : <Navigate to="/auth/login" />;
};

export default PrivateRoute