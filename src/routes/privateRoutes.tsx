import PrivateRoute from "@/shared/components/PrivateRoute";
import MainLayout from "@/components/layouts/MainLayout";
import AprobationsPage from "@/pages/equipos/AprobationsPage";
import CargosPage from "@/pages/equipos/CargosPage";
import DepartmentsPage from "@/pages/equipos/DepartmentPage";
import RolesPage from "@/pages/equipos/RolesPage";
import UsersPage from "@/pages/equipos/UsersPage";
import UserPage from "@/pages/user/UserPage";


// Placeholders para las páginas privadas (solo divs con nombres)



const DelegacionesPage = () => <div>Delegaciones Page</div>;

const FlujosPlantillasPage = () => <div>Flujos (Plantillas) Page</div>;
const SolicitudesPage = () => <div>Solicitudes Page</div>;
const FlujosActivosPage = () => <div>Flujos Activos Page</div>;
const MisPasosPage = () => <div>Mis Pasos Page</div>;
const PropuestasVotacionesPage = () => <div>Propuestas y Votaciones Page</div>;

const BackupsPage = () => <div>Backups Page</div>;
const IncidentesPage = () => <div>Incidentes Page</div>;

const MetricasPage = () => <div>Métricas Page</div>;
const InformesPage = () => <div>Informes Page</div>;

export const privateRoutes = [
  {
    element: <MainLayout />,
    children: [
      // Módulo: Gestión de Equipos y Permisos
      { path: '/equipos/usuarios', element: <PrivateRoute element={<UsersPage />} /> },
      { path: '/equipos/departamentos', element: <PrivateRoute element={<DepartmentsPage />} /> },
      { path: '/equipos/roles', element: <PrivateRoute element={<RolesPage />} /> },
      { path: '/equipos/cargos', element: <PrivateRoute element={<CargosPage />} /> },
      { path: '/equipos/delegaciones', element: <PrivateRoute element={<DelegacionesPage />} /> },
      { path: '/equipos/grupos-aprobacion', element: <PrivateRoute element={<AprobationsPage />} /> },

      // Módulo: Gestión de Flujos y Solicitudes
      { path: '/flujos/plantillas', element: <PrivateRoute element={<FlujosPlantillasPage />} /> },
      { path: '/flujos/solicitudes', element: <PrivateRoute element={<SolicitudesPage />} /> },
      { path: '/flujos/activos', element: <PrivateRoute element={<FlujosActivosPage />} /> },
      { path: '/flujos/mis-pasos', element: <PrivateRoute element={<MisPasosPage />} /> },
      { path: '/flujos/propuestas-votaciones', element: <PrivateRoute element={<PropuestasVotacionesPage />} /> },

      // Módulo: Backup y Seguridad
      { path: '/backup/backups', element: <PrivateRoute element={<BackupsPage />} /> },
      { path: '/backup/incidentes', element: <PrivateRoute element={<IncidentesPage />} /> },

      // Módulo: Métricas e Informes
      { path: '/metricas/metricas', element: <PrivateRoute element={<MetricasPage />} /> },
      { path: '/metricas/informes', element: <PrivateRoute element={<InformesPage />} /> },
    
      // Modulo: Perfil
      { path: '/profile', element: <PrivateRoute element={<UserPage />} />},
    ],
  },
];