/**
 * Tipos mock para testing del componente MisPasosPage
 * Simulan datos reales que vendrian del endpoint GET /api/pasosolicitud/usuario/{usuarioId}
 */

import type { PasoSolicitud } from '@/types/bpm/paso';

export const MOCK_PASOS_SOLICITUD: PasoSolicitud[] = [
  {
    id: 1,
    pasoId: 1001,
    solicitudId: 501,
    usuarioAsignadoId: 1, // Para usuario común
    tipoPaso: 'aprobacion',
    estado: 'pendiente',
    nombre: 'Aprobación de Compra de Equipos',
    descripcion: 'Revisión y aprobación de solicitud de compra de equipos de cómputo para el departamento de TI',
    fechaCreacion: '2024-01-15T10:30:00Z',
    fechaVencimiento: '2024-01-20T17:00:00Z',
    prioridad: 'alta',
    solicitudNombre: 'Solicitud de Compra - Laptops Dell',
    solicitanteNombre: 'Juan Pérez',
    flujoId: 201,
    flujoNombre: 'Flujo de Compras TI',
    usuarioAsignado: {
      id: 1,
      nombre: 'María García',
      email: 'maria.garcia@empresa.com'
    },
    metadatos: {
      montoTotal: 45000,
      categoria: 'equipos',
      departamento: 'TI'
    },
    comentarios: 'Solicitud urgente para proyecto Q1'
  },
  // Agregar pasos para cualquier usuario ID que esté logueado
  {
    id: 6,
    pasoId: 1006,
    solicitudId: 506,
    usuarioAsignadoId: 0, // Este será reemplazado dinámicamente
    tipoPaso: 'aprobacion',
    estado: 'pendiente',
    nombre: 'Aprobación de Presupuesto 2024',
    descripcion: 'Revisión de solicitud de presupuesto para nuevo proyecto',
    fechaCreacion: '2024-01-18T08:00:00Z',
    fechaVencimiento: '2024-01-22T18:00:00Z',
    prioridad: 'alta',
    solicitudNombre: 'Solicitud de Presupuesto - Proyecto Alpha',
    solicitanteNombre: 'Roberto Martinez',
    flujoId: 206,
    flujoNombre: 'Flujo de Presupuestos',
    usuarioAsignado: {
      id: 0,
      nombre: 'Usuario Actual',
      email: 'usuario@empresa.com'
    },
    metadatos: {
      monto: 75000,
      proyecto: 'Alpha',
      año: 2024
    }
  },
  {
    id: 7,
    pasoId: 1007,
    solicitudId: 507,
    usuarioAsignadoId: 0, // Este será reemplazado dinámicamente
    tipoPaso: 'ejecucion',
    estado: 'pendiente',
    nombre: 'Ejecutar Compra Aprobada',
    descripcion: 'Procesar la compra ya aprobada por gerencia',
    fechaCreacion: '2024-01-17T11:30:00Z',
    prioridad: 'media',
    solicitudNombre: 'Solicitud de Compra - Material de Oficina',
    solicitanteNombre: 'Carmen Jiménez',
    flujoId: 207,
    flujoNombre: 'Flujo de Compras Menores',
    usuarioAsignado: {
      id: 0,
      nombre: 'Usuario Actual',
      email: 'usuario@empresa.com'
    },
    metadatos: {
      categoria: 'material_oficina',
      urgente: false
    }
  },
  {
    id: 2,
    pasoId: 1002,
    solicitudId: 502,
    usuarioAsignadoId: 1,
    tipoPaso: 'ejecucion',
    estado: 'en_proceso',
    nombre: 'Ejecutar Orden de Compra',
    descripcion: 'Procesar la orden de compra aprobada y coordinar con proveedores',
    fechaCreacion: '2024-01-14T14:15:00Z',
    prioridad: 'media',
    solicitudNombre: 'Solicitud de Servicio - Mantenimiento',
    solicitanteNombre: 'Ana López',
    flujoId: 202,
    flujoNombre: 'Flujo de Servicios',
    usuarioAsignado: {
      id: 1,
      nombre: 'María García',
      email: 'maria.garcia@empresa.com'
    },
    metadatos: {
      proveedor: 'Servicios Tech SA',
      tipoServicio: 'mantenimiento_preventivo'
    }
  },
  {
    id: 3,
    pasoId: 1003,
    solicitudId: 503,
    usuarioAsignadoId: 1,
    tipoPaso: 'revision',
    estado: 'pendiente',
    nombre: 'Revisión Legal de Contrato',
    descripcion: 'Revisión de términos y condiciones del contrato de servicios externos',
    fechaCreacion: '2024-01-16T09:00:00Z',
    fechaVencimiento: '2024-01-25T16:00:00Z',
    prioridad: 'baja',
    solicitudNombre: 'Solicitud de Contrato - Consultoría',
    solicitanteNombre: 'Carlos Ruiz',
    flujoId: 203,
    flujoNombre: 'Flujo Legal',
    usuarioAsignado: {
      id: 1,
      nombre: 'María García',
      email: 'maria.garcia@empresa.com'
    },
    metadatos: {
      tipoContrato: 'consultoria',
      duracion: '6_meses',
      valor: 30000
    },
    comentarios: 'Requiere revisión de cláusulas específicas'
  },
  {
    id: 4,
    pasoId: 1004,
    solicitudId: 504,
    usuarioAsignadoId: 2,
    tipoPaso: 'validacion',
    estado: 'completado',
    nombre: 'Validación de Presupuesto',
    descripcion: 'Validar disponibilidad presupuestaria para nueva iniciativa',
    fechaCreacion: '2024-01-12T11:20:00Z',
    fechaCompletado: '2024-01-13T15:45:00Z',
    prioridad: 'alta',
    solicitudNombre: 'Solicitud de Proyecto - Nueva Línea',
    solicitanteNombre: 'Luis Morales',
    flujoId: 204,
    flujoNombre: 'Flujo de Proyectos',
    usuarioAsignado: {
      id: 2,
      nombre: 'Roberto Silva',
      email: 'roberto.silva@empresa.com'
    },
    metadatos: {
      presupuestoSolicitado: 120000,
      centro_costo: 'PROJ001',
      año_fiscal: 2024
    }
  },
  {
    id: 5,
    pasoId: 1005,
    solicitudId: 505,
    usuarioAsignadoId: 1,
    tipoPaso: 'aprobacion',
    estado: 'rechazado',
    nombre: 'Aprobación de Viaje de Negocios',
    descripcion: 'Evaluación de solicitud de viaje para conferencia internacional',
    fechaCreacion: '2024-01-10T16:30:00Z',
    fechaCompletado: '2024-01-11T10:15:00Z',
    prioridad: 'media',
    solicitudNombre: 'Solicitud de Viaje - Conferencia Tech',
    solicitanteNombre: 'Sandra Vega',
    flujoId: 205,
    flujoNombre: 'Flujo de Viajes',
    usuarioAsignado: {
      id: 1,
      nombre: 'María García',
      email: 'maria.garcia@empresa.com'
    },
    metadatos: {
      destino: 'Las Vegas, USA',
      duracion: '5_dias',
      costo_estimado: 8500
    },
    comentarios: 'Rechazado por restricciones presupuestarias Q1'
  }
];

export const MOCK_USERS = [
  {
    idUsuario: 1,
    oid: 1,
    nombre: 'María García',
    email: 'maria.garcia@empresa.com',
    rolNombre: 'Administrador' as const,
    departamentoNombre: 'Administración',
    cargoNombre: 'Jefe de Administración'
  },
  {
    idUsuario: 2,
    oid: 2,
    nombre: 'Roberto Silva',
    email: 'roberto.silva@empresa.com',
    rolNombre: 'Miembro' as const,
    departamentoNombre: 'Finanzas',
    cargoNombre: 'Analista Financiero'
  },
  {
    idUsuario: 3,
    oid: 3,
    nombre: 'Juan Pérez',
    email: 'juan.perez@empresa.com',
    rolNombre: 'Miembro' as const,
    departamentoNombre: 'TI',
    cargoNombre: 'Desarrollador Senior'
  }
];