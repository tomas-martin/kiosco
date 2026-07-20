import * as dotenv from 'dotenv';
// Cargar variables de entorno antes de importar otros módulos
dotenv.config();

import aplicacion from './aplicacion';

const PUERTO = process.env.PORT || 4000;

aplicacion.listen(PUERTO, () => {
  console.log(`=================================================`);
  console.log(`  SERVIDOR STOCKFLOW INICIADO EN PUERTO: ${PUERTO}`);
  console.log(`  Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`  URL de API: http://localhost:${PUERTO}/api`);
  console.log(`=================================================`);
});
