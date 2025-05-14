import { PrivateRoute } from "@/components/auth/PrivateRoute";
import MainLayout from "@/components/layouts/MainLayout";
import UsersPage from "@/pages/users/UsersPage";

// Placeholders para las páginas privadas (solo divs con nombres)

const DepartamentosPage = () => <div>Departamentos Page</div>;
const RolesPage = () => <div>Roles Page</div>;
const CargosPage = () => <div>Cargos Page</div>;
const DelegacionesPage = () => <div>Delegaciones Page</div>;
const GruposAprobacionPage = () => <div>Grupos de Aprobación Page</div>;

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
      { path: '/equipos/usuarios', element: <PrivateRoute><UsersPage /></PrivateRoute> },
      { path: '/equipos/departamentos', element: <PrivateRoute><DepartamentosPage /></PrivateRoute> },
      { path: '/equipos/roles', element: <PrivateRoute><RolesPage /></PrivateRoute> },
      { path: '/equipos/cargos', element: <PrivateRoute><CargosPage /></PrivateRoute> },
      { path: '/equipos/delegaciones', element: <PrivateRoute><DelegacionesPage /></PrivateRoute> },
      { path: '/equipos/grupos-aprobacion', element: <PrivateRoute><GruposAprobacionPage /></PrivateRoute> },

      // Módulo: Gestión de Flujos y Solicitudes
      { path: '/flujos/plantillas', element: <PrivateRoute><FlujosPlantillasPage /></PrivateRoute> },
      { path: '/flujos/solicitudes', element: <PrivateRoute><SolicitudesPage /></PrivateRoute> },
      { path: '/flujos/activos', element: <PrivateRoute><FlujosActivosPage /></PrivateRoute> },
      { path: '/flujos/mis-pasos', element: <PrivateRoute><MisPasosPage /></PrivateRoute> },
      { path: '/flujos/propuestas-votaciones', element: <PrivateRoute><PropuestasVotacionesPage /></PrivateRoute> },

      // Módulo: Backup y Seguridad
      { path: '/backup/backups', element: <PrivateRoute><BackupsPage /></PrivateRoute> },
      { path: '/backup/incidentes', element: <PrivateRoute><IncidentesPage /></PrivateRoute> },

      // Módulo: Métricas e Informes
      { path: '/metricas/metricas', element: <PrivateRoute><MetricasPage /></PrivateRoute> },
      { path: '/metricas/informes', element: <PrivateRoute><InformesPage /></PrivateRoute> },
    ],
  },
];