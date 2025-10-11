import { createBrowserRouter, Navigate } from "react-router-dom";
import { privateRoutes } from "./privateRoutes";
import { publicRoutes } from "./publicRoutes";

export const router = createBrowserRouter([
  ...publicRoutes,
  ...privateRoutes,
  { path: '/unauthorized', element: <div>No autorizado</div> },
  { path: '*', element: <Navigate to="/" /> },
]);