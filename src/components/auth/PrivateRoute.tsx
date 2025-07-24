
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectAccessToken } from '@/store/auth/authSlice';

interface PrivateRouteProps {
  children: React.ReactNode;
}

export const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const  accessToken  = useSelector(selectAccessToken);
  const location = useLocation();

  if (!accessToken) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};