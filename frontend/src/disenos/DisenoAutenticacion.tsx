import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAutenticacion } from '../hooks/useAutenticacion';

export const DisenoAutenticacion: React.FC = () => {
  const { autenticado, cargando } = useAutenticacion();

  if (cargando) {
    return (
      <div className="min-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-indigo-600 dark:border-zinc-800" />
      </div>
    );
  }

  // Redirigir al panel si ya está autenticado
  if (autenticado) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-zinc-50 px-4 py-12 dark:bg-zinc-950 sm:px-6 lg:px-8">
      {/* Círculos decorativos de fondo difuminados (Efecto Glassmorphism Premium) */}
      <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl" />
      <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-purple-500/10 blur-3xl" />

      <div className="relative w-full max-w-md">
        {/* Cabecera del Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 shadow-lg shadow-indigo-600/20 text-white font-bold text-xl tracking-tight">
            SF
          </div>
          <h2 className="mt-4 text-center text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white font-sans">
            StockFlow
          </h2>
          <p className="mt-1 text-center text-sm text-zinc-600 dark:text-zinc-400">
            Administración profesional de comercios
          </p>
        </div>

        {/* Tarjeta del Formulario */}
        <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white/70 p-8 shadow-xl backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-900/70">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DisenoAutenticacion;
