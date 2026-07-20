import React from 'react';
import { useAutenticacion } from '../../hooks/useAutenticacion';
import { LogOut, LayoutDashboard, Store, Users, ShoppingBag } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const Dashboard: React.FC = () => {
  const { usuario, salir } = useAutenticacion();

  const alCerrarSesion = async () => {
    try {
      await salir();
      toast.success('Sesión cerrada correctamente.');
    } catch (e) {
      toast.error('Error al cerrar sesión.');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans">
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
              SF
            </div>
            <span className="font-semibold text-lg">StockFlow</span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Hola, {usuario?.nombre} ({usuario?.rol})
            </span>
            <button
              onClick={alCerrarSesion}
              className="inline-flex items-center justify-center p-2 rounded-lg text-zinc-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all focus:outline-none"
              title="Cerrar Sesión"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Panel de Control</h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm mt-1">
            Bienvenido a StockFlow. Fase 1 de autenticación y base de datos completada con éxito.
          </p>
        </div>

        {/* Mocks de Tarjetas de Resumen (Fase 1 demostrativa) */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="p-6 rounded-2xl border border-zinc-200/80 bg-white dark:border-zinc-800/80 dark:bg-zinc-900 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl text-indigo-600 dark:text-indigo-400">
              <LayoutDashboard className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Caja Abierta</p>
              <h3 className="text-lg font-bold mt-0.5">$0.00</h3>
            </div>
          </div>

          <div className="p-6 rounded-2xl border border-zinc-200/80 bg-white dark:border-zinc-800/80 dark:bg-zinc-900 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl text-emerald-600 dark:text-emerald-400">
              <Store className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Ventas del Día</p>
              <h3 className="text-lg font-bold mt-0.5">0</h3>
            </div>
          </div>

          <div className="p-6 rounded-2xl border border-zinc-200/80 bg-white dark:border-zinc-800/80 dark:bg-zinc-900 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-xl text-purple-600 dark:text-purple-400">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Stock Bajo</p>
              <h3 className="text-lg font-bold mt-0.5">0</h3>
            </div>
          </div>

          <div className="p-6 rounded-2xl border border-zinc-200/80 bg-white dark:border-zinc-800/80 dark:bg-zinc-900 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl text-amber-600 dark:text-amber-400">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Clientes Activos</p>
              <h3 className="text-lg font-bold mt-0.5">0</h3>
            </div>
          </div>
        </div>

        {/* Tarjeta Informativa de la Fase */}
        <div className="rounded-2xl border border-indigo-200/60 dark:border-indigo-900/30 bg-indigo-50/30 dark:bg-indigo-950/10 p-6">
          <h4 className="text-sm font-semibold text-indigo-900 dark:text-indigo-400">Información del Sistema</h4>
          <p className="text-xs text-indigo-800/80 dark:text-indigo-400/80 mt-2 leading-relaxed max-w-2xl">
            La arquitectura principal del Frontend y Backend ha sido desplegada. Los JWT de acceso son almacenados en memoria y los Refresh Tokens en cookies HTTP-only para máxima seguridad (OWASP Top 10 compliant). El sistema de base de datos relacional con Prisma está configurado para almacenar productos, stock, ventas, historial de caja e integrarse con la IA local de Ollama en las siguientes fases.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
