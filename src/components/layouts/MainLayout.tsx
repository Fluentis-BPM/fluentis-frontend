import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Bell, User, LogOut, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/auth/useAuth';
import { selectUser } from '@/store/auth/authSlice';
import { cn } from '@/utils/utils';


export default function MainLayout() {
  const { handleLogout } = useAuth();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [expandedModules, setExpandedModules] = useState({
    equiposPermisos: false,
    flujosSolicitudes: false,
    backupSeguridad: false,
    metricasInformes: false,
  });

  const toggleModule = (module: keyof typeof expandedModules) => {
    setExpandedModules((prev) => ({
      ...prev,
      [module]: !prev[module],
    }));
  };

  const handleLogoutClick = () => {
    handleLogout();
    navigate('/login');
  };

  // Simulación de notificaciones (esto debería venir de la API o Redux)
  const notifications = [
    { id: 1, message: 'Nueva solicitud pendiente de aprobación', priority: 'alta', leida: false, fecha_envio: '2025-05-12T10:00:00' },
    { id: 2, message: 'Flujo activo finalizado', priority: 'media', leida: true, fecha_envio: '2025-05-11T15:30:00' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="relative bg-gradient-to-br bg-gradient-primary text-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mr-3">
              <img src="/img/isologo-asofarma.png" alt="ASOFARMA Logo" className="rounded-full" />
            </div>
            <span className="text-xl font-bold">ASOFARMA BPM</span>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notificaciones */}
            <div className="relative">
              <button
                className="p-2 rounded-full hover:bg-white/20"
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              >
                <Bell className="h-6 w-6" />
                {notifications.some((n) => !n.leida) && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-error rounded-full border-2 border-white"></span>
                )}
              </button>
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-white/20 z-50">
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-primary">Notificaciones</h3>
                    <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={cn(
                              'p-3 rounded-md border',
                              notification.leida ? 'border-gray-200 bg-gray-50' : 'border-primary/20 bg-primary/5'
                            )}
                          >
                            <p className="text-sm text-foreground">{notification.message}</p>
                            <p className="text-xs text-muted-foreground">{notification.fecha_envio}</p>
                            <span
                              className={cn(
                                'text-xs font-medium',
                                notification.priority === 'alta' && 'text-error',
                                notification.priority === 'media' && 'text-warning',
                                notification.priority === 'baja' && 'text-info'
                              )}
                            >
                              {notification.priority}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No hay notificaciones.</p>
                      )}
                    </div>
                    <Button variant="link" className="w-full mt-2 text-primary">
                      Ver todas las notificaciones
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Perfil */}
            <div className="relative">
              <button
                className="flex items-center space-x-2 p-2 rounded-full hover:bg-white/20"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                <User className="h-6 w-6" />
                <span className="text-sm">{user?.nombre || 'Usuario'}</span>
                <ChevronDown className="h-4 w-4" />
              </button>
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-white/20 z-50">
                  <div className="p-2">
                    <Link to="/profile">
                      <Button variant="ghost" className="w-full justify-start text-foreground">
                        Ver Perfil
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-foreground"
                      onClick={handleLogoutClick}
                    >
                      Cerrar Sesión
                      <LogOut className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-md border-r border-border">
          <nav className="p-4 space-y-2">
            {/* Módulo: Gestión de Equipos y Permisos */}
            <div>
              <button
                className="flex items-center w-full p-2 text-primary font-semibold rounded-md hover:bg-primary/10"
                onClick={() => toggleModule('equiposPermisos')}
              >
                {expandedModules.equiposPermisos ? (
                  <ChevronDown className="h-4 w-4 mr-2" />
                ) : (
                  <ChevronRight className="h-4 w-4 mr-2" />
                )}
                Gestión de Equipos y Permisos
              </button>
              {expandedModules.equiposPermisos && (
                <div className="ml-4 mt-2 space-y-1">
                  <Link to="/equipos/usuarios">
                    <Button variant="ghost" className="w-full justify-start text-foreground">
                      Usuarios
                    </Button>
                  </Link>
                  <Link to="/equipos/departamentos">
                    <Button variant="ghost" className="w-full justify-start text-foreground">
                      Departamentos
                    </Button>
                  </Link>
                  <Link to="/equipos/roles">
                    <Button variant="ghost" className="w-full justify-start text-foreground">
                      Roles
                    </Button>
                  </Link>
                  <Link to="/equipos/cargos">
                    <Button variant="ghost" className="w-full justify-start text-foreground">
                      Cargos
                    </Button>
                  </Link>
                  <Link to="/equipos/delegaciones">
                    <Button variant="ghost" className="w-full justify-start text-foreground">
                      Delegaciones
                    </Button>
                  </Link>
                  <Link to="/equipos/grupos-aprobacion">
                    <Button variant="ghost" className="w-full justify-start text-foreground">
                      Grupos de Aprobación
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Módulo: Gestión de Flujos y Solicitudes */}
            <div>
              <button
                className="flex items-center w-full p-2 text-primary font-semibold rounded-md hover:bg-primary/10"
                onClick={() => toggleModule('flujosSolicitudes')}
              >
                {expandedModules.flujosSolicitudes ? (
                  <ChevronDown className="h-4 w-4 mr-2" />
                ) : (
                  <ChevronRight className="h-4 w-4 mr-2" />
                )}
                Gestión de Flujos y Solicitudes
              </button>
              {expandedModules.flujosSolicitudes && (
                <div className="ml-4 mt-2 space-y-1">
                  <Link to="/flujos/plantillas">
                    <Button variant="ghost" className="w-full justify-start text-foreground">
                      Flujos (Plantillas)
                    </Button>
                  </Link>
                  <Link to="/flujos/solicitudes">
                    <Button variant="ghost" className="w-full justify-start text-foreground">
                      Solicitudes
                    </Button>
                  </Link>
                  <Link to="/flujos/activos">
                    <Button variant="ghost" className="w-full justify-start text-foreground">
                      Flujos Activos
                    </Button>
                  </Link>
                  <Link to="/flujos/mis-pasos">
                    <Button variant="ghost" className="w-full justify-start text-foreground">
                      Mis Pasos
                    </Button>
                  </Link>
                  <Link to="/flujos/propuestas-votaciones">
                    <Button variant="ghost" className="w-full justify-start text-foreground">
                      Propuestas y Votaciones
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Módulo: Backup y Seguridad */}
            <div>
              <button
                className="flex items-center w-full p-2 text-primary font-semibold rounded-md hover:bg-primary/10"
                onClick={() => toggleModule('backupSeguridad')}
              >
                {expandedModules.backupSeguridad ? (
                  <ChevronDown className="h-4 w-4 mr-2" />
                ) : (
                  <ChevronRight className="h-4 w-4 mr-2" />
                )}
                Backup y Seguridad
              </button>
              {expandedModules.backupSeguridad && (
                <div className="ml-4 mt-2 space-y-1">
                  <Link to="/backup/backups">
                    <Button variant="ghost" className="w-full justify-start text-foreground">
                      Backups
                    </Button>
                  </Link>
                  <Link to="/backup/incidentes">
                    <Button variant="ghost" className="w-full justify-start text-foreground">
                      Incidentes
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Módulo: Métricas e Informes */}
            <div>
              <button
                className="flex items-center w-full p-2 text-primary font-semibold rounded-md hover:bg-primary/10"
                onClick={() => toggleModule('metricasInformes')}
              >
                {expandedModules.metricasInformes ? (
                  <ChevronDown className="h-4 w-4 mr-2" />
                ) : (
                  <ChevronRight className="h-4 w-4 mr-2" />
                )}
                Métricas e Informes
              </button>
              {expandedModules.metricasInformes && (
                <div className="ml-4 mt-2 space-y-1">
                  <Link to="/metricas/metricas">
                    <Button variant="ghost" className="w-full justify-start text-foreground">
                      Métricas
                    </Button>
                  </Link>
                  <Link to="/metricas/informes">
                    <Button variant="ghost" className="w-full justify-start text-foreground">
                      Informes
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </aside>

        {/* Contenido Principal */}
        <main className="flex-1 p-6 bg-background">
          <Outlet />
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-br bg-gradient-primary text-white py-4">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">&copy; 2025 ASOFARMA Centro América & Caribe. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}