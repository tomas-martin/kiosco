import { useContext } from 'react';
import { AutenticacionContexto } from '../contextos/AutenticacionContexto';

export function useAutenticacion() {
  const contexto = useContext(AutenticacionContexto);
  
  if (contexto === undefined) {
    throw new Error('useAutenticacion debe ser utilizado dentro de un AutenticacionProveedor');
  }
  
  return contexto;
}
export default useAutenticacion;
