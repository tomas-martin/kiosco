import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAutenticacion } from '../hooks/useAutenticacion';

export const RutaProtegida: React.FC = () => {
  const { autenticado, cargando } = useAutenticacion();

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-indigo-600 dark:border-zinc-800" />
      </div>
    );
  }

  if (!autenticado) {
    return <Navigate to="/acceso" replace />;
  }

  return <Outlet />;
};

export default RutaProtegida;
