import { authRoutes } from './authRoutes';
import { homeRoutes } from './homeRoutes';


export const routes = [
  ...homeRoutes,
  ...authRoutes,
  { path: '/unauthorized', element: <div>No autorizado</div> },
  { path: '*', element: <div>404 - Página no encontrada</div> },
];