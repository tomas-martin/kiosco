import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff, Lock, Mail, Loader2 } from 'lucide-react';
import { useAutenticacion } from '../../hooks/useAutenticacion';

const EsquemaValidacion = z.object({
  email: z
    .string()
    .min(1, 'El correo electrónico es requerido.')
    .email('El formato del correo electrónico no es válido.'),
  contrasena: z
    .string()
    .min(1, 'La contraseña es requerida.')
    .min(6, 'La contraseña debe tener al menos 6 caracteres.'),
});

type FormularioDatos = z.infer<typeof EsquemaValidacion>;

export const Acceso: React.FC = () => {
  const { acceso } = useAutenticacion();
  const navigate = useNavigate();
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [cargandoEnvio, setCargandoEnvio] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormularioDatos>({
    resolver: zodResolver(EsquemaValidacion),
    defaultValues: {
      email: '',
      contrasena: '',
    },
  });

  const alEnviar = async (datos: FormularioDatos) => {
    setCargandoEnvio(true);
    try {
      await acceso(datos.email, datos.contrasena);
      toast.success('¡Bienvenido a StockFlow!');
      navigate('/dashboard');
    } catch (error: any) {
      const mensaje = error.response?.data?.mensaje || 'Error al iniciar sesión. Intente nuevamente.';
      toast.error(mensaje);
    } finally {
      setCargandoEnvio(false);
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-6">
        Iniciar Sesión
      </h3>

      <form onSubmit={handleSubmit(alEnviar)} className="space-y-5">
        {/* Campo de Correo Electrónico */}
        <div>
          <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
            Correo Electrónico
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Mail className="h-5 w-5 text-zinc-400 dark:text-zinc-500" />
            </div>
            <input
              type="email"
              {...register('email')}
              placeholder="ejemplo@stockflow.com"
              className={`block w-full rounded-xl border pl-10 pr-4 py-2.5 text-sm bg-zinc-50/50 dark:bg-zinc-800/30 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all ${
                errors.email
                  ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500'
                  : 'border-zinc-200 dark:border-zinc-800'
              }`}
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-xs text-red-500 font-medium">{errors.email.message}</p>
          )}
        </div>

        {/* Campo de Contraseña */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
              Contraseña
            </label>
            <Link
              to="/recuperar-contrasena"
              className="text-xs font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 transition-colors"
            >
              ¿Olvidó su contraseña?
            </Link>
          </div>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Lock className="h-5 w-5 text-zinc-400 dark:text-zinc-500" />
            </div>
            <input
              type={mostrarContrasena ? 'text' : 'password'}
              {...register('contrasena')}
              placeholder="••••••••"
              className={`block w-full rounded-xl border pl-10 pr-10 py-2.5 text-sm bg-zinc-50/50 dark:bg-zinc-800/30 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all ${
                errors.contrasena
                  ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500'
                  : 'border-zinc-200 dark:border-zinc-800'
              }`}
            />
            <button
              type="button"
              onClick={() => setMostrarContrasena(!mostrarContrasena)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-400 focus:outline-none"
            >
              {mostrarContrasena ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          {errors.contrasena && (
            <p className="mt-1 text-xs text-red-500 font-medium">{errors.contrasena.message}</p>
          )}
        </div>

        {/* Botón de Ingreso */}
        <button
          type="submit"
          disabled={cargandoEnvio}
          className="flex w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-600/10 hover:bg-indigo-500 hover:shadow-indigo-600/20 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 active:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {cargandoEnvio ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Ingresando...
            </>
          ) : (
            'Ingresar al Sistema'
          )}
        </button>
      </form>
    </div>
  );
};

export default Acceso;
