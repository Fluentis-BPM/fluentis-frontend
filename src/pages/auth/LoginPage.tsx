import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/auth/useAuth';
import { useSelector } from 'react-redux';
import {  selectStatus, selectUser, selectError } from '@/store/auth/authSlice';
import { ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const { handleLogin } = useAuth();
  const navigate = useNavigate();
  const status = useSelector(selectStatus);
  const user = useSelector(selectUser);
  const error = useSelector(selectError);

  useEffect(() => {
    if (status === 'succeeded' && user) {
      setTimeout(() => {
        navigate('/equipos/usuarios');
      }, 2000);
    }
  }, [status, user, navigate]);

  const handleLoginClick = () => {
    handleLogin();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      
      <div className="relative bg-white p-8 rounded-lg shadow-lg border border-border max-w-md w-full">
        <button
          onClick={() => navigate('/')}
          className="absolute top-4 left-4 text-muted-foreground hover:text-primary transition-colors"
          aria-label="Volver"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex justify-center mb-6">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mr-3">
              <img src="/img/isologo-asofarma.png" alt="ASOFARMA Logo" className="rounded-full" />
            </div>
            <span className="text-xl font-bold text-foreground">ASOFARMA BPM</span>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-foreground text-center mb-4">INICIAR SESIÓN</h1>
        <p className="text-center text-muted-foreground mb-6">
          Inicia sesión con tu cuenta de Microsoft para acceder al sistema BPM.
        </p>

        {status === 'idle' && (
          <Button
            onClick={handleLoginClick}
            className="w-full bg-primary hover:bg-primary-dark text-white button-hover"
          >
            <img src='/icons/microsoft.png' alt="Microsoft Logo" className="inline-block mr-2 w-5 h-5"/>
            Iniciar Sesión con Microsoft
          </Button>
        )}

        {status === 'loading' && (
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            <p className="mt-2 text-foreground">Verificando credenciales...</p>
          </div>
        )}

        {status === 'succeeded' && user && (
          <div className="text-center">
            <div className="text-green-500 mb-4">
              <svg
                className="h-12 w-12 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
            <p className="text-foreground">¡Login exitoso!</p>
            <p className="text-muted-foreground mt-2">
              Bienvenido, {user.nombre}. Serás redirigido al dashboard...
            </p>
          </div>
        )}

        {(status === 'failed' || error) && (
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <svg
                className="h-12 w-12 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </div>
            <p className="text-foreground">Error al iniciar sesión</p>
            <p className="text-muted-foreground mt-2">{error || 'Error desconocido'}</p>
            <Button
              onClick={handleLoginClick}
              className="mt-4 bg-primary hover:bg-primary-dark text-white button-hover"
            >
              Intentar de nuevo
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}