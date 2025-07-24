import { useState } from 'react';
import { Bell, User as UserIcon, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/utils/utils';
import { User } from '@/types/auth';

interface TopBarProps {
  user: User | null;
}

export default function TopBar({ user }: TopBarProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Simulación de notificaciones (esto debería venir de la API o Redux)
  const notifications = [
    { id: 1, message: 'Nueva solicitud pendiente de aprobación', priority: 'alta', leida: false, fecha_envio: '2025-05-12T10:00:00' },
    { id: 2, message: 'Flujo activo finalizado', priority: 'media', leida: true, fecha_envio: '2025-05-11T15:30:00' },
  ];

  const hasUnreadNotifications = notifications.some(n => !n.leida);

  return (
    <header className="bg-white border-b border-border">
      <div className="px-6 py-4 flex items-center justify-end">
        {/* Search Bar */}
        {/* <div className="w-96">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-4 h-4 text-muted-foreground" />
            </div>
            <input
              type="search"
              className="block w-full p-2 pl-10 text-sm rounded-lg bg-muted border border-border focus:ring-primary focus:border-primary"
              placeholder="Buscar..."
            />
          </div>
        </div> */}

        {/* Right Actions */}
        <div className="flex items-center space-x-2">
          {/* Notifications */}
          <div className="relative">
            <button
              className="p-2 rounded-lg hover:bg-muted flex items-center justify-center"
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            >
              <Bell className="h-5 w-5 text-foreground" />
              {hasUnreadNotifications && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>
              )}
            </button>
            
            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-border z-50">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-semibold text-foreground">Notificaciones</h3>
                    <span className="text-xs font-medium text-primary cursor-pointer">Marcar todas como leídas</span>
                  </div>
                  
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={cn(
                            'p-3 rounded-md border',
                            notification.leida ? 'border-gray-200 bg-muted' : 'border-primary/20 bg-primary/5'
                          )}
                        >
                          <p className="text-sm text-foreground">{notification.message}</p>
                          <div className="flex justify-between items-center mt-1">
                            <p className="text-xs text-muted-foreground">
                              {new Date(notification.fecha_envio).toLocaleString()}
                            </p>
                            <span
                              className={cn(
                                'text-xs font-medium px-2 py-0.5 rounded-full',
                                notification.priority === 'alta' && 'bg-error/10 text-error',
                                notification.priority === 'media' && 'bg-warning/10 text-warning',
                                notification.priority === 'baja' && 'bg-info/10 text-info'
                              )}
                            >
                              {notification.priority}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">No hay notificaciones.</p>
                    )}
                  </div>
                  
                  <div className="mt-4 text-center">
                    <Link to="/notificaciones" className="text-sm font-medium text-primary hover:underline">
                      Ver todas las notificaciones
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Profile Menu */}
          <div className="relative">
            <button
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white">
                {user?.nombre?.charAt(0) || 'U'}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium">{user?.nombre || 'Usuario'}</p>
                <p className="text-xs text-muted-foreground">{user?.departamento || 'Departamento'}</p>
              </div>
              <ChevronDown className="h-4 w-4" />
            </button>
            
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-border z-50">
                <div className="p-2">
                  <Link to="/profile">
                    <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted">
                      <UserIcon className="h-4 w-4 text-primary" />
                      <span className="text-sm">Ver Perfil</span>
                    </div>
                  </Link>
                  <Link to="/configuracion/cuenta">
                    <div className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted">
                      <UserIcon className="h-4 w-4 text-primary" />
                      <span className="text-sm">Configuración</span>
                    </div>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}