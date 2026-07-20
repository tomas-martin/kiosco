import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import clienteApi from '../../servicios/api';

const EsquemaValidacion = z.object({
  email: z
    .string()
    .min(1, 'El correo electrónico es requerido.')
    .email('El formato del correo electrónico no es válido.'),
});

type FormularioDatos = z.infer<typeof EsquemaValidacion>;

export const RecuperarContrasena: React.FC = () => {
  const [cargandoEnvio, setCargandoEnvio] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [tokenPrueba, setTokenPrueba] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormularioDatos>({
    resolver: zodResolver(EsquemaValidacion),
    defaultValues: {
      email: '',
    },
  });

  const alEnviar = async (datos: FormularioDatos) => {
    setCargandoEnvio(true);
    try {
      const respuesta = await clienteApi.post('/autenticacion/recuperar-contrasena', datos);
      setEnviado(true);
      toast.success('Instrucciones enviadas si el correo está registrado.');
      
      // Capturar token de desarrollo para facilitar pruebas
      if (respuesta.data.tokenPrueba) {
        setTokenPrueba(respuesta.data.tokenPrueba);
      }
    } catch (error: any) {
      const mensaje = error.response?.data?.mensaje || 'Error al procesar la solicitud.';
      toast.error(mensaje);
    } finally {
      setCargandoEnvio(false);
    }
  };

  if (enviado) {
    return (
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <CheckCircle2 className="h-12 w-12 text-emerald-500" />
        </div>
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
          Enlace Enviado
        </h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Si el correo electrónico ingresado está registrado en nuestro sistema, recibirá un enlace para redefinir su contraseña.
        </p>

        {tokenPrueba && (
          <div className="mt-4 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900/30 text-left">
            <span className="text-xs font-bold text-yellow-800 dark:text-yellow-400 uppercase tracking-wider block mb-1">
              [ENTORNO DESARROLLO] Token de pruebas:
            </span>
            <p className="text-xs break-all text-zinc-700 dark:text-zinc-300 select-all font-mono">
              {tokenPrueba}
            </p>
            <p className="text-[10px] text-zinc-500 mt-2">
              Copia este token para simular la redefinición en la ruta `/redefinir-contrasena?token=...`
            </p>
          </div>
        )}

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
        Recuperar Contraseña
      </h3>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
        Ingrese su correo electrónico y le enviaremos las instrucciones de recuperación.
      </p>

      <form onSubmit={handleSubmit(alEnviar)} className="space-y-5">
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

        <button
          type="submit"
          disabled={cargandoEnvio}
          className="flex w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-600/10 hover:bg-indigo-500 hover:shadow-indigo-600/20 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 active:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {cargandoEnvio ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Procesando...
            </>
          ) : (
            'Enviar Instrucciones'
          )}
        </button>

        <div className="text-center pt-2">
          <Link
            to="/acceso"
            className="inline-flex items-center text-xs font-medium text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300 transition-colors"
          >
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Volver al inicio de sesión
          </Link>
        </div>
      </form>
    </div>
  );
};

export default RecuperarContrasena;
