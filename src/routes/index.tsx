import { privateRoutes } from "./privateRoutes";
import { publicRoutes } from "./publicRoutes";



export const routes = [
  ...publicRoutes,
  ...privateRoutes,
  { path: '/unauthorized', element: <div>No autorizado</div> },
  { path: '*', element: <div>404 - Página no encontrada</div> },
];