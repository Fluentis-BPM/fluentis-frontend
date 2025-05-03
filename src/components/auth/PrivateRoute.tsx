
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

interface PrivateRouteProps {
  children: React.ReactNode;
}

export const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const { accessToken } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  if (!accessToken) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};