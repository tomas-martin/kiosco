import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff, Lock, Loader2, ArrowLeft } from 'lucide-react';
import clienteApi from '../../servicios/api';

const EsquemaValidacion = z.object({
  nuevaContrasena: z
    .string()
    .min(1, 'La nueva contraseña es requerida.')
    .min(6, 'La nueva contraseña debe tener al menos 6 caracteres.'),
  confirmarContrasena: z
    .string()
    .min(1, 'Debe confirmar su contraseña.'),
}).refine((data) => data.nuevaContrasena === data.confirmarContrasena, {
  message: 'Las contraseñas no coinciden.',
  path: ['confirmarContrasena'],
});

type FormularioDatos = z.infer<typeof EsquemaValidacion>;

export const RedefinirContrasena: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [cargandoEnvio, setCargandoEnvio] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormularioDatos>({
    resolver: zodResolver(EsquemaValidacion),
    defaultValues: {
      nuevaContrasena: '',
      confirmarContrasena: '',
    },
  });

  const alEnviar = async (datos: FormularioDatos) => {
    if (!token) {
      toast.error('Token de recuperación no válido o inexistente.');
      return;
    }

    setCargandoEnvio(true);
    try {
      await clienteApi.post('/autenticacion/redefinir-contrasena', {
        token,
        nuevaContrasena: datos.nuevaContrasena,
      });
      toast.success('Contraseña redefinida exitosamente.');
      navigate('/acceso');
    } catch (error: any) {
      const mensaje = error.response?.data?.mensaje || 'Error al redefinir la contraseña.';
      toast.error(mensaje);
    } finally {
      setCargandoEnvio(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <h3 className="text-lg font-semibold text-red-500">
          Enlace Inválido
        </h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Falta el token de seguridad para restablecer la contraseña. Asegúrese de haber seguido el enlace correcto.
        </p>
        <div className="pt-4">
          <Link
            to="/acceso"
            className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
        Redefinir Contraseña
      </h3>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
        Ingrese su nueva contraseña de acceso.
      </p>

      <form onSubmit={handleSubmit(alEnviar)} className="space-y-5">
        {/* Nueva Contraseña */}
        <div>
          <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
            Nueva Contraseña
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Lock className="h-5 w-5 text-zinc-400 dark:text-zinc-500" />
            </div>
            <input
              type={mostrarContrasena ? 'text' : 'password'}
              {...register('nuevaContrasena')}
              placeholder="••••••••"
              className={`block w-full rounded-xl border pl-10 pr-10 py-2.5 text-sm bg-zinc-50/50 dark:bg-zinc-800/30 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all ${
                errors.nuevaContrasena
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
          {errors.nuevaContrasena && (
            <p className="mt-1 text-xs text-red-500 font-medium">{errors.nuevaContrasena.message}</p>
          )}
        </div>

        {/* Confirmar Contraseña */}
        <div>
          <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
            Confirmar Contraseña
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Lock className="h-5 w-5 text-zinc-400 dark:text-zinc-500" />
            </div>
            <input
              type={mostrarContrasena ? 'text' : 'password'}
              {...register('confirmarContrasena')}
              placeholder="••••••••"
              className={`block w-full rounded-xl border pl-10 pr-10 py-2.5 text-sm bg-zinc-50/50 dark:bg-zinc-800/30 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all ${
                errors.confirmarContrasena
                  ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500'
                  : 'border-zinc-200 dark:border-zinc-800'
              }`}
            />
          </div>
          {errors.confirmarContrasena && (
            <p className="mt-1 text-xs text-red-500 font-medium">{errors.confirmarContrasena.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={cargandoEnvio}
          className="flex w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-600/10 hover:bg-indigo-500 hover:shadow-indigo-600/20 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 active:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {cargandoEnvio ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Restableciendo...
            </>
          ) : (
            'Restablecer Contraseña'
          )}
        </button>
      </form>
    </div>
  );
};

export default RedefinirContrasena;
