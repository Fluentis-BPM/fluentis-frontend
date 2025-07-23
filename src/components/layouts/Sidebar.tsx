import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { 
  Users, Shield, GitPullRequest, BarChart3, 
  LogOut, ChevronRight, ChevronDown, HomeIcon,
  Menu
} from 'lucide-react';
import { cn } from '@/utils/utils';
import { useAuth } from '@/hooks/auth/useAuth';
import { User } from '@/types/auth';

interface SidebarProps {
  user: User | null;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  items?: { path: string; label: string }[];
}

export default function Sidebar({ user }: SidebarProps) {
  const { handleLogout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogoutClick = () => {
    handleLogout();
    navigate('/login');
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Define navigation items with icons
  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <HomeIcon className="h-5 w-5" />,
      items: [
        { path: '/dashboard', label: 'Resumen' }
      ]
    },
    {
      id: 'equiposPermisos',
      label: 'Equipos y Permisos',
      icon: <Users className="h-5 w-5" />,
      items: [
        { path: '/equipos/usuarios', label: 'Usuarios' },
        { path: '/equipos/departamentos', label: 'Departamentos' },
        { path: '/equipos/roles', label: 'Roles' },
        { path: '/equipos/cargos', label: 'Cargos' },
        { path: '/equipos/delegaciones', label: 'Delegaciones' },
        { path: '/equipos/grupos-aprobacion', label: 'Grupos de Aprobación' }
      ]
    },
    {
      id: 'flujosSolicitudes',
      label: 'Flujos y Solicitudes',
      icon: <GitPullRequest className="h-5 w-5" />,
      items: [
        { path: '/flujos/plantillas', label: 'Flujos (Plantillas)' },
        { path: '/flujos/solicitudes', label: 'Solicitudes' },
        { path: '/flujos/activos', label: 'Flujos Activos' },
        { path: '/flujos/mis-pasos', label: 'Mis Pasos' },
        { path: '/flujos/propuestas-votaciones', label: 'Propuestas y Votaciones' }
      ]
    },
    {
      id: 'backupSeguridad',
      label: 'Backup y Seguridad',
      icon: <Shield className="h-5 w-5" />,
      items: [
        { path: '/backup/backups', label: 'Backups' },
        { path: '/backup/incidentes', label: 'Incidentes' }
      ]
    },
    {
      id: 'metricasInformes',
      label: 'Métricas e Informes',
      icon: <BarChart3 className="h-5 w-5" />,
      items: [
        { path: '/metricas/metricas', label: 'Métricas' },
        { path: '/metricas/informes', label: 'Informes' }
      ]
    },
  ];

  // Check if path is active
  const isActivePath = (path: string) => {
    return location.pathname === path;
  };
  
  // Check if module has any active path
  const hasActivePath = (items?: { path: string; label: string }[]) => {
    if (!items) return false;
    return items.some(item => isActivePath(item.path));
  };

  return (
    <>
      <aside className={cn(
        "bg-white border-r border-border shadow-lg flex flex-col fixed left-0 top-0 h-screen z-30 transition-all duration-300 ease-in-out overflow-hidden",
        isCollapsed ? "w-20" : "w-72"
      )}>
        {/* Logo and Brand */}
        <div className="p-4 py-4.5 border-b border-border bg-gradient-primary text-white relative min-h-[80px]">
          <button
            onClick={toggleSidebar}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-white/10 transition-colors"
            title={isCollapsed ? "Expandir menú" : "Colapsar menú"}
          >
            <Menu className="h-5 w-5 text-white" />
          </button>
          <div className={cn(
            "flex items-center",
            isCollapsed ? "justify-center" : "space-x-3"
          )}>
            <div className="h-12 w-12 flex items-center justify-center">
              <img src="/img/logo-fluentis.png" alt="ASOFARMA Logo" className="w-full h-full object-contain" />
            </div>
            {!isCollapsed && (
              <div>
                <h1 className="font-bold text-lg">ASOFARMA</h1>
                <p className="text-xs opacity-80">Business Process Management</p>
              </div>
            )}
          </div>
        </div>

        {/* User Profile Summary */}
        <div className="p-4 border-b border-border bg-muted">
          <div className={cn(
            "flex items-center",
            isCollapsed ? "justify-center" : "space-x-3"
          )}>
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white flex-shrink-0">
              {user?.nombre?.charAt(0) || 'U'}
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">{user?.nombre || 'Usuario'}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.rol || 'Rol no definido'}</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-1">
            {navItems.map((item) => (
              <div key={item.id} className="mb-1">
                <button
                  className={cn(
                    "flex items-center w-full p-3 rounded-lg text-sm font-medium transition-colors",
                    hasActivePath(item.items) 
                      ? "bg-primary text-white" 
                      : "text-foreground hover:bg-primary-light hover:text-primary"
                  )}
                  onClick={() => toggleModule(item.id)}
                  title={isCollapsed ? item.label : undefined}
                >
                  <span className={cn(
                    "flex-shrink-0",
                    isCollapsed ? "mx-auto" : "mr-3"
                  )}>{item.icon}</span>
                  {!isCollapsed && (
                    <>
                      <span className="truncate">{item.label}</span>
                      <span className="ml-auto flex-shrink-0">
                        {expandedModules[item.id] ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </span>
                    </>
                  )}
                </button>
                
                {!isCollapsed && expandedModules[item.id] && item.items && (
                  <div className="ml-9 mt-1 space-y-1">
                    {item.items.map((subItem) => (
                      <Link key={subItem.path} to={subItem.path}>
                        <div
                          className={cn(
                            "p-2 rounded-md text-sm transition-colors truncate",
                            isActivePath(subItem.path)
                              ? "bg-secondary-light text-primary font-medium"
                              : "text-foreground hover:bg-muted"
                          )}
                        >
                          {subItem.label}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-border mt-auto">
          <button
            onClick={handleLogoutClick}
            className={cn(
              "flex items-center p-3 rounded-lg text-sm font-medium text-error hover:bg-error/10 transition-colors",
              isCollapsed ? "justify-center w-full" : "w-full"
            )}
            title={isCollapsed ? "Cerrar Sesión" : undefined}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && <span className="ml-3 truncate">Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      {/* Spacer div to push content */}
      <div className={cn(
        "flex-shrink-0 transition-all duration-300 ease-in-out",
        isCollapsed ? "w-20" : "w-72"
      )} />
    </>
  );
}