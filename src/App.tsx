
import { RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store, AppDispatch } from './store';
import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { msalConfig } from "./authConfig";
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setAccessToken, verifyToken } from './store/auth/authSlice';

import { router } from './routes';
const msalInstance = new PublicClientApplication(msalConfig);

// Component to handle authentication initialization
function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if there's a stored access token
        const storedToken = localStorage.getItem('accessToken');
        
        if (storedToken) {
          // Set the token in the store
          dispatch(setAccessToken(storedToken));
          
          // Verify the token with the backend
          await dispatch(verifyToken(storedToken));
        }
      } catch (error) {
        console.error('Error initializing authentication:', error);
        // Clear invalid token
        localStorage.removeItem('accessToken');
      } finally {
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, [dispatch]);

  // Don't render the app until auth is initialized
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function App() {
  return (
    <Provider store={store}>
      <MsalProvider instance={msalInstance}>
        <AuthInitializer>
          <RouterProvider router={router} />
        </AuthInitializer>
      </MsalProvider>
    </Provider>
  );
}

export default App;