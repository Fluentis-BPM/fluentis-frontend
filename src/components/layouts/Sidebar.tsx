import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { 
  Users, Shield, GitPullRequest, BarChart3, 
  LogOut, ChevronRight, ChevronDown, HomeIcon,
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
    // {
    //   id: 'configuracion',
    //   label: 'Configuración',
    //   icon: <Settings className="h-5 w-5" />,
    //   items: [
    //     { path: '/configuracion/sistema', label: 'Sistema' },
    //     { path: '/configuracion/cuenta', label: 'Mi Cuenta' }
    //   ]
    // }
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
    <aside className="bg-white border-r border-border w-72 shadow-lg flex flex-col">
      {/* Logo and Brand */}
      <div className="p-4 py-4.5 border-b border-border bg-gradient-primary text-white">
        <div className="flex items-center space-x-3">
          <div className="h-12 w-12 flex items-center justify-center">
            <img src="/img/logo-fluentis.png" alt="ASOFARMA Logo" className="" />
          </div>
          <div>
            <h1 className="font-bold text-lg">ASOFARMA</h1>
            <p className="text-xs opacity-80">Business Process Management</p>
          </div>
        </div>
      </div>

      {/* User Profile Summary */}
      <div className="p-4 border-b border-border bg-muted">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white">
            {user?.nombre?.charAt(0) || 'U'}
          </div>
          <div>
            <p className="font-medium text-sm">{user?.nombre || 'Usuario'}</p>
            <p className="text-xs text-muted-foreground">{user?.rol || 'Rol no definido'}</p>
          </div>
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
              >
                <span className="mr-3">{item.icon}</span>
                <span>{item.label}</span>
                <span className="ml-auto">
                  {expandedModules[item.id] ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </span>
              </button>
              
              {expandedModules[item.id] && item.items && (
                <div className="ml-9 mt-1 space-y-1">
                  {item.items.map((subItem) => (
                    <Link key={subItem.path} to={subItem.path}>
                      <div
                        className={cn(
                          "p-2 rounded-md text-sm transition-colors",
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
      <div className="p-4 border-t border-border">
        <button
          onClick={handleLogoutClick}
          className="flex items-center w-full p-3 rounded-lg text-sm font-medium text-error hover:bg-error/10 transition-colors"
        >
          <LogOut className="h-5 w-5 mr-3" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}