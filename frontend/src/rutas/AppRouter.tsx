import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AutenticacionProveedor } from '../contextos/AutenticacionContexto';
import DisenoAutenticacion from '../disenos/DisenoAutenticacion';
import Acceso from '../paginas/acceso/Acceso';
import RecuperarContrasena from '../paginas/acceso/RecuperarContrasena';
import RedefinirContrasena from '../paginas/acceso/RedefinirContrasena';
import RutaProtegida from './RutaProtegida';
import Dashboard from '../paginas/dashboard/Dashboard';

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <AutenticacionProveedor>
        <Routes>
          {/* Rutas Públicas (Módulo de Autenticación) */}
          <Route element={<DisenoAutenticacion />}>
            <Route path="/acceso" element={<Acceso />} />
            <Route path="/recuperar-contrasena" element={<RecuperarContrasena />} />
            <Route path="/redefinir-contrasena" element={<RedefinirContrasena />} />
          </Route>

          {/* Rutas Protegidas */}
          <Route element={<RutaProtegida />}>
            <Route path="/dashboard" element={<Dashboard />} />
            {/* Las próximas páginas (POS, Inventario, Caja, etc.) se agregarán aquí */}
          </Route>

          {/* Redirección por defecto */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AutenticacionProveedor>
    </BrowserRouter>
  );
};

export default AppRouter;
