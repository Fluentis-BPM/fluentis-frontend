import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, GitPullRequest,
  LogOut, ChevronRight, ChevronDown, HomeIcon,
  Menu, User, Settings
} from 'lucide-react';
import { cn } from '@/utils/utils';
import NotificationBell from '@/components/notifications/NotificationBell';
import { useAuth } from '@/hooks/auth/useAuth';
import { User as UserType } from '@/types/auth';

interface SidebarProps {
  user: UserType | null;
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

  const toggleModule = (moduleId: string, items?: { path: string; label: string }[]) => {
    if (isCollapsed && items && items.length > 0) {
      // When collapsed, navigate to first child instead of toggling
      navigate(items[0].path);
    } else {
      // Normal toggle behavior when expanded
      setExpandedModules(prev => ({
        ...prev,
        [moduleId]: !prev[moduleId]
      }));
    }
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
      label: 'BPM',
      icon: <GitPullRequest className="h-5 w-5" />,
      items: [
        { path: '/bpm', label: 'Resumen' },
        { path: '/bpm/solicitudes', label: 'Solicitudes' },
        { path: '/bpm/flujos', label: 'Flujos' },
        { path: '/flujos/plantillas', label: 'Plantillas Solicitud' },
        { path: '/flujos/mis-pasos', label: 'Mis Pasos' },
      ]
    },
  ];

  // Additional user menu items
  const userMenuItems: NavItem[] = [
    {
      id: 'profile',
      label: 'Mi Perfil',
      icon: <User className="h-5 w-5" />,
      items: [
        { path: '/profile', label: 'Ver Perfil' }
      ]
    },
    {
      id: 'configuration',
      label: 'Configuración',
      icon: <Settings className="h-5 w-5" />,
      items: [
        { path: '/configuracion/cuenta', label: 'Configuración de Cuenta' }
      ]
    }
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
      <motion.aside 
        className={cn(
          "bg-white border-r border-border shadow-lg flex flex-col fixed left-0 top-0 h-screen z-30 overflow-hidden",
          isCollapsed ? "w-16" : "w-72"
        )}
        initial={{ x: -100, opacity: 0 }}
        animate={{ 
          x: 0, 
          opacity: 1,
          width: isCollapsed ? 64 : 288 
        }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 30,
          width: { type: "tween", duration: 0.3, ease: "easeInOut" }
        }}
      >
        {/* Logo and Brand */}
        <div className="p-4 py-4.5 border-b border-border bg-gradient-primary text-white relative min-h-[80px]">
          <button
            onClick={toggleSidebar}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white/20"
            title={isCollapsed ? "Expandir menú" : "Colapsar menú"}
            aria-label={isCollapsed ? "Expandir menú" : "Colapsar menú"}
          >
            <Menu className="h-5 w-5 text-white" />
          </button>
          <div className={cn(
            "flex items-center",
            isCollapsed ? "justify-center" : "space-x-3"
          )}>
            <div className="h-12 w-12 flex items-center justify-center">
              <img 
                src="/img/logo-fluentis.png" 
                alt="ASOFARMA Logo" 
                className="w-full h-full object-contain" 
              />
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
        <div className={cn(
          "border-b border-border bg-muted",
          isCollapsed ? "p-2" : "p-4"
        )}>
          <div className={cn(
            "flex items-center",
            isCollapsed ? "justify-center" : "space-x-3"
          )}>
            <div className={cn(
              "rounded-full bg-primary flex items-center justify-center text-white flex-shrink-0 font-semibold",
              isCollapsed ? "h-8 w-8 text-sm" : "h-10 w-10 text-base"
            )}>
              {user?.nombre?.charAt(0).toUpperCase() || 'U'}
            </div>
            {isCollapsed ? (
              // Compact bell over avatar area
              <NotificationBell userId={user?.idUsuario} compact />
            ) : (
              <div className="min-w-0 flex-1 flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{user?.nombre || 'Usuario'}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.cargoNombre || 'Cargo no definido'}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-xs text-primary font-medium truncate">{user?.rolNombre || 'Sin rol'}</span>
                    {user?.departamentoNombre && (
                      <>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground truncate">{user.departamentoNombre}</span>
                      </>
                    )}
                  </div>
                </div>
                {/* Bell aligned to the right of user info */}
                <NotificationBell userId={user?.idUsuario} />
              </div>
            )}
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto scrollbar-thin">
          <div className={cn(
            isCollapsed ? "p-2 space-y-2" : "p-4 space-y-1"
          )}>
            {navItems.map((item) => (
              <div key={item.id} className={cn(isCollapsed ? "mb-2" : "mb-1")}>
                <motion.button
                  className={cn(
                    "flex items-center text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-lg",
                    isCollapsed 
                      ? "w-12 h-12 p-0 justify-center mx-auto" 
                      : "w-full p-3",
                    hasActivePath(item.items) 
                      ? "bg-primary/10 text-primary border border-primary/20" 
                      : "text-foreground hover:bg-primary-light hover:text-primary"
                  )}
                  onClick={() => toggleModule(item.id, item.items)}
                  title={isCollapsed ? item.label : undefined}
                  aria-label={isCollapsed ? item.label : undefined}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className={cn(
                    "flex-shrink-0",
                    isCollapsed ? "" : "mr-3"
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
                </motion.button>
                
                <AnimatePresence>
                  {!isCollapsed && expandedModules[item.id] && item.items && (
                    <motion.div 
                      className="ml-9 mt-1 space-y-1"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                    >
                      {item.items.map((subItem, index) => (
                        <motion.div
                          key={subItem.path}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05, duration: 0.2 }}
                        >
                          <Link to={subItem.path}>
                            <div
                              className={cn(
                                "p-2 rounded-md text-sm transition-colors truncate",
                                isActivePath(subItem.path)
                                  ? "bg-primary/10 text-primary border border-primary/20 font-medium shadow-sm"
                                  : "text-foreground hover:bg-muted hover:text-primary"
                              )}
                            >
                              {subItem.label}
                            </div>
                          </Link>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
            
            {/* Separator */}
            <div className={cn(
              "border-t border-border",
              isCollapsed ? "my-2 mx-2" : "my-4"
            )}></div>
            
            {/* User Menu Items */}
            {userMenuItems.map((item) => (
              <div key={item.id} className={cn(isCollapsed ? "mb-2" : "mb-1")}>
                <motion.button
                  className={cn(
                    "flex items-center text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-lg",
                    isCollapsed 
                      ? "w-12 h-12 p-0 justify-center mx-auto" 
                      : "w-full p-3",
                    hasActivePath(item.items) 
                      ? "bg-primary/10 text-primary border border-primary/20" 
                      : "text-foreground hover:bg-primary-light hover:text-primary"
                  )}
                  onClick={() => toggleModule(item.id, item.items)}
                  title={isCollapsed ? item.label : undefined}
                  aria-label={isCollapsed ? item.label : undefined}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className={cn(
                    "flex-shrink-0",
                    isCollapsed ? "" : "mr-3"
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
                </motion.button>
                
                <AnimatePresence>
                  {!isCollapsed && expandedModules[item.id] && item.items && (
                    <motion.div 
                      className="ml-9 mt-1 space-y-1"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                    >
                      {item.items.map((subItem, index) => (
                        <motion.div
                          key={subItem.path}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05, duration: 0.2 }}
                        >
                          <Link to={subItem.path}>
                            <div
                              className={cn(
                                "p-2 rounded-md text-sm transition-colors truncate",
                                isActivePath(subItem.path)
                                  ? "bg-primary/10 text-primary border border-primary/20 font-medium shadow-sm"
                                  : "text-foreground hover:bg-muted hover:text-primary"
                              )}
                            >
                              {subItem.label}
                            </div>
                          </Link>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </nav>

        {/* Logout Button */}
        <div className={cn(
          "border-t border-border mt-auto",
          isCollapsed ? "p-2" : "p-4"
        )}>
          <motion.button
            onClick={handleLogoutClick}
            className={cn(
              "flex items-center text-sm font-medium text-error hover:bg-error/10 transition-colors rounded-lg",
              isCollapsed 
                ? "w-12 h-12 p-0 justify-center mx-auto" 
                : "w-full p-3"
            )}
            title={isCollapsed ? "Cerrar Sesión" : undefined}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <LogOut className={cn(
              "h-5 w-5 flex-shrink-0",
              isCollapsed ? "" : "mr-3"
            )} />
            {!isCollapsed && <span className="truncate">Cerrar Sesión</span>}
          </motion.button>
        </div>
      </motion.aside>

      {/* Spacer div to push content */}
      <motion.div 
        className="flex-shrink-0"
        animate={{ width: isCollapsed ? 64 : 288 }}
        transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
      />
    </>
  );
}