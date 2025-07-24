import { createBrowserRouter, Navigate } from "react-router-dom";
import PrivateRoute from "./shared/components/PrivateRoute";
import { BPMDashboard } from "./pages/bpm/BPMDashboard";

// Import pages
import LandingPage from "./pages/home/LandingPage";
import LoginPage from "./pages/auth/LoginPage";
import MainLayout from "./components/layouts/MainLayout";

// Import equipment pages
import UsersPage from "./pages/equipos/UsersPage";
import DepartmentPage from "./pages/equipos/DepartmentPage";
import RolesPage from "./pages/equipos/RolesPage";
import CargosPage from "./pages/equipos/CargosPage";
import UserPage from "./pages/user/UserPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/auth/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: <PrivateRoute element={<MainLayout />} />,
    children: [
      // Dashboard
      {
        path: "dashboard",
        element: <div>Dashboard Coming Soon...</div>,
      },
      
      // Equipos y Permisos
      {
        path: "equipos/usuarios",
        element: <UsersPage />,
      },
      {
        path: "equipos/departamentos",
        element: <DepartmentPage />,
      },
      {
        path: "equipos/roles",
        element: <RolesPage />,
      },
      {
        path: "equipos/cargos",
        element: <CargosPage />,
      },

      // BPM
      {
        path: "bpm",
        element: <BPMDashboard />,
      },

      // User Profile
      {
        path: "profile",
        element: <UserPage />,
      },
      {
        path: "configuracion/cuenta",
        element: <UserPage />,
      },

      // Placeholders for other routes mentioned in sidebar
      {
        path: "equipos/delegaciones",
        element: <div>Delegaciones - Coming Soon</div>,
      },
      {
        path: "equipos/grupos-aprobacion",
        element: <div>Grupos de Aprobación - Coming Soon</div>,
      },
      {
        path: "flujos/plantillas",
        element: <div>Flujos (Plantillas) - Coming Soon</div>,
      },
      {
        path: "flujos/solicitudes",
        element: <div>Solicitudes - Coming Soon</div>,
      },
      {
        path: "flujos/activos",
        element: <div>Flujos Activos - Coming Soon</div>,
      },
      {
        path: "flujos/mis-pasos",
        element: <div>Mis Pasos - Coming Soon</div>,
      },
      {
        path: "flujos/propuestas-votaciones",
        element: <div>Propuestas y Votaciones - Coming Soon</div>,
      },
      {
        path: "backup/backups",
        element: <div>Backups - Coming Soon</div>,
      },
      {
        path: "backup/incidentes",
        element: <div>Incidentes - Coming Soon</div>,
      },
      {
        path: "metricas/metricas",
        element: <div>Métricas - Coming Soon</div>,
      },
      {
        path: "metricas/informes",
        element: <div>Informes - Coming Soon</div>,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" />,
  },
]);