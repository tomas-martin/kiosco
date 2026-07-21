import React, { createContext, useState, useEffect, type ReactNode } from 'react';
import type { Usuario } from '../tipos';
import clienteApi from '../servicios/api';

interface AutenticacionContextoTipo {
  usuario: Usuario | null;
  cargando: boolean;
  autenticado: boolean;
  acceso: (email: string, contrasena: string) => Promise<void>;
  salir: () => Promise<void>;
}

export const AutenticacionContexto = createContext<AutenticacionContextoTipo | undefined>(undefined);

export const AutenticacionProveedor: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);

  // Inicializar cargando el usuario desde localStorage si el token existe
  useEffect(() => {
    const inicializarSesion = () => {
      const token = localStorage.getItem('tokenAcceso');
      const usuarioGuardado = localStorage.getItem('usuario');

      if (token && usuarioGuardado) {
        try {
          setUsuario(JSON.parse(usuarioGuardado));
        } catch (e) {
          localStorage.removeItem('tokenAcceso');
          localStorage.removeItem('usuario');
        }
      }
      setCargando(false);
    };

    inicializarSesion();

    // Escuchar el evento de sesión expirada arrojado por el interceptor de Axios
    const manejarSesionExpirada = () => {
      setUsuario(null);
    };

    window.addEventListener('sesionExpirada', manejarSesionExpirada);

    return () => {
      window.removeEventListener('sesionExpirada', manejarSesionExpirada);
    };
  }, []);

  const acceso = async (email: string, contrasena: string) => {
    setCargando(true);
    try {
      const respuesta = await clienteApi.post('/autenticacion/acceso', { email, contrasena });
      const { usuario: datosUsuario, tokenAcceso } = respuesta.data.datos;

      localStorage.setItem('tokenAcceso', tokenAcceso);
      localStorage.setItem('usuario', JSON.stringify(datosUsuario));
      setUsuario(datosUsuario);
    } catch (error) {
      throw error;
    } finally {
      setCargando(false);
    }
  };

  const salir = async () => {
    setCargando(true);
    try {
      await clienteApi.post('/autenticacion/salir', {});
    } catch (e) {
      console.error('Error al cerrar sesión en el servidor:', e);
    } finally {
      localStorage.removeItem('tokenAcceso');
      localStorage.removeItem('usuario');
      setUsuario(null);
      setCargando(false);
    }
  };

  return (
    <AutenticacionContexto.Provider
      value={{
        usuario,
        cargando,
        autenticado: !!usuario,
        acceso,
        salir,
      }}
    >
      {children}
    </AutenticacionContexto.Provider>
  );
};
