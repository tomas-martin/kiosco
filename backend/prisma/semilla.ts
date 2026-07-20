import { PrismaClient, Rol, Estado } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function principal() {
  console.log('Iniciando semilla de la base de datos...');

  // 1. Crear Usuario Administrador por defecto si no existe ninguno
  const cantidadUsuarios = await prisma.usuario.count();
  if (cantidadUsuarios === 0) {
    const contrasenaHash = await bcrypt.hash('StockFlow2026!', 10);
    const admin = await prisma.usuario.create({
      data: {
        nombre: 'Administrador Principal',
        email: 'admin@stockflow.com',
        contrasena: contrasenaHash,
        rol: Rol.ADMINISTRADOR,
        estado: Estado.ACTIVO,
      },
    });
    console.log(`Usuario administrador creado por defecto: ${admin.email} (Contraseña: StockFlow2026!)`);
  } else {
    console.log('Ya existen usuarios registrados en la base de datos.');
  }

  // 2. Crear Categorías Básicas
  const categoriasBanas = [
    { nombre: 'Bebidas', descripcion: 'Gaseosas, aguas, jugos y bebidas alcohólicas' },
    { nombre: 'Snacks y Almacén', descripcion: 'Galletitas, papas fritas, golosinas y abarrotes' },
    { nombre: 'Lácteos y Fiambrería', descripcion: 'Leche, yogures, quesos y fiambres' },
    { nombre: 'Cigarrillos y Tabaquería', descripcion: 'Cigarrillos, encendedores y accesorios' },
    { nombre: 'Limpieza y Perfumería', descripcion: 'Artículos de aseo personal y del hogar' }
  ];

  for (const cat of categoriasBanas) {
    await prisma.categoria.upsert({
      where: { nombre: cat.nombre },
      update: {},
      create: {
        nombre: cat.nombre,
        descripcion: cat.descripcion,
      },
    });
  }
  console.log('Categorías iniciales creadas o verificadas.');

  // 3. Crear Marcas Básicas
  const marcasBasicas = [
    { nombre: 'Coca-Cola' },
    { nombre: 'Pepsi' },
    { nombre: 'Arcor' },
    { nombre: 'Lays' },
    { nombre: 'La Serenísima' }
  ];

  for (const marca of marcasBasicas) {
    await prisma.marca.upsert({
      where: { nombre: marca.nombre },
      update: {},
      create: {
        nombre: marca.nombre,
      },
    });
  }
  console.log('Marcas iniciales creadas o verificadas.');

  // 4. Crear Proveedor por Defecto
  const cantidadProveedores = await prisma.proveedor.count();
  if (cantidadProveedores === 0) {
    await prisma.proveedor.create({
      data: {
        nombre: 'Distribuidora Central S.A.',
        cuit: '30-12345678-9',
        telefono: '011-4567-8901',
        email: 'contacto@distribuidoracentral.com',
        direccion: 'Av. Corrientes 1234, CABA',
        observaciones: 'Proveedor principal de bebidas y snacks.',
      },
    });
    console.log('Proveedor inicial creado.');
  }

  // 5. Crear Cliente Consumidor Final
  const cantidadClientes = await prisma.cliente.count();
  if (cantidadClientes === 0) {
    await prisma.cliente.create({
      data: {
        nombre: 'Consumidor',
        apellido: 'Final',
        dni: '99999999',
        telefono: 'N/A',
        email: 'consumidorfinal@stockflow.com',
        direccion: 'Ventas en mostrador',
        observaciones: 'Cliente genérico para ventas rápidas.',
        saldoDeuda: 0.00,
      },
    });
    console.log('Cliente Consumidor Final creado.');
  }

  // 6. Crear Configuración por Defecto
  const cantidadConfig = await prisma.configuracion.count();
  if (cantidadConfig === 0) {
    await prisma.configuracion.create({
      data: {
        nombreNegocio: 'StockFlow Kiosco',
        simboloMoneda: '$',
        codigoMoneda: 'ARS',
        porcentajeIVA: 0.00,
      },
    });
    console.log('Configuración de negocio inicial creada.');
  }

  console.log('Semilla de base de datos completada con éxito.');
}

principal()
  .catch((e) => {
    console.error('Error al ejecutar la semilla:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
