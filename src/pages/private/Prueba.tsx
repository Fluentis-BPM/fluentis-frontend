
import { RootState } from '@/store';
import { useAuth } from "@/hooks/auth/useAuth"
import { useSelector } from 'react-redux';

const PruebaPage = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { handleLogout } = useAuth();
  return (
    <div className="p-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4">¡Bienvenido a la ruta privada!</h1>
        
        <div className="mb-6">
          <p className="text-gray-600">Usuario conectado:</p>
          <p className="font-semibold">{user?.name}</p>
          <p className="text-sm text-gray-500">{user?.email}</p>
        </div>

        <button 
          onClick={() => handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
};

export default PruebaPage;