// src/features/shared/components/PrivateLayout.tsx
import React from "react";
import { Outlet, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/features/auth/slices/authSlice";
import { RootState } from "@/store";

const PrivateLayout = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div className="flex">
      {/* Sidebar de navegación */}
      <nav className="w-64 bg-gray-800 text-white p-4">
        <h2 className="text-xl">Menú</h2>
        <ul>
          <li>
            <Link to="/users/list">Lista de Usuarios</Link>
          </li>
          <li>
            <Link to="/users/form">Crear Usuario</Link>
          </li>
        </ul>
        <button onClick={handleLogout} className="mt-4 text-red-400">
          Cerrar Sesión
        </button>
      </nav>
      {/* Contenido dinámico */}
      <main className="flex-1 p-4">
        <h1>Bienvenido, {user?.name || "Usuario"}</h1>
        <Outlet /> {/* Aquí se renderizan las rutas privadas */}
      </main>
    </div>
  );
};

export default PrivateLayout;