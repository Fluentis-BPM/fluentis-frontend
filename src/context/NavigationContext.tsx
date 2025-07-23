import { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Define the type for our navigation context
interface NavigationContextType {
  currentModule: string | null;
  currentPath: string;
  breadcrumbs: { label: string; path: string }[];
  setCurrentModule: (module: string | null) => void;
  updateBreadcrumbs: (breadcrumbs: { label: string; path: string }[]) => void;
}

// Create the context with a default value
const NavigationContext = createContext<NavigationContextType>({
  currentModule: null,
  currentPath: '',
  breadcrumbs: [],
  setCurrentModule: () => {},
  updateBreadcrumbs: () => {},
});

// Map of paths to module IDs and breadcrumb labels
const pathMap: Record<string, { moduleId: string; breadcrumbs: { label: string; path: string }[] }> = {
  '/dashboard': { 
    moduleId: 'dashboard', 
    breadcrumbs: [{ label: 'Dashboard', path: '/dashboard' }] 
  },
  '/equipos/usuarios': {
    moduleId: 'equiposPermisos',
    breadcrumbs: [
      { label: 'Equipos y Permisos', path: '/equipos' },
      { label: 'Usuarios', path: '/equipos/usuarios' }
    ]
  },
  '/equipos/departamentos': {
    moduleId: 'equiposPermisos',
    breadcrumbs: [
      { label: 'Equipos y Permisos', path: '/equipos' },
      { label: 'Departamentos', path: '/equipos/departamentos' }
    ]
  },
  // Add more paths as needed
};

// Provider component
export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [currentModule, setCurrentModule] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState<string>(location.pathname);
  const [breadcrumbs, setBreadcrumbs] = useState<{ label: string; path: string }[]>([]);

  // Update current path and breadcrumbs when location changes
  useEffect(() => {
    setCurrentPath(location.pathname);
    
    // Find matching path in our pathMap
    const pathEntry = pathMap[location.pathname];
    if (pathEntry) {
      setCurrentModule(pathEntry.moduleId);
      setBreadcrumbs(pathEntry.breadcrumbs);
    } else {
      // Default breadcrumb if path not found in map
      setBreadcrumbs([{ label: 'Dashboard', path: '/dashboard' }]);
    }
  }, [location.pathname]);

  // Function to manually update breadcrumbs
  const updateBreadcrumbs = (newBreadcrumbs: { label: string; path: string }[]) => {
    setBreadcrumbs(newBreadcrumbs);
  };

  return (
    <NavigationContext.Provider 
      value={{ 
        currentModule, 
        currentPath, 
        breadcrumbs, 
        setCurrentModule, 
        updateBreadcrumbs 
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

// Custom hook to use the navigation context
export function useNavigation() {
  return useContext(NavigationContext);
}