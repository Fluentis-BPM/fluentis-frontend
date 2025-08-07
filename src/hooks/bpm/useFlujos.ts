import { useState, useCallback } from 'react';
import { 
  FlujoActivo, 
  EstadoFlujo, 
  PlantillaFlujo,
  EjecucionPaso,
  EstadisticasFlujos,
  PasoSolicitud,
  CaminoParalelo,
  DatosSolicitud,
  ResultadoPaso
} from '@/types/bpm/flow';
import { RelacionInput, CamposDinamicos } from '@/types/bpm/inputs';

/**
 * Hook para manejar flujos activos
 * Gestiona la creación, seguimiento y finalización de flujos
 */
export const useFlujos = () => {
  const [flujosActivos, setFlujosActivos] = useState<FlujoActivo[]>([]);
  const [plantillasFlujo, setPlantillasFlujo] = useState<PlantillaFlujo[]>([]);
  const [ejecucionesPasos, setEjecucionesPasos] = useState<EjecucionPaso[]>([]);
  const [pasosSolicitud, setPasosSolicitud] = useState<PasoSolicitud[]>([]);
  const [caminosParalelos, setCaminosParalelos] = useState<CaminoParalelo[]>([]);

  // Generar IDs únicos
  const generarIdUnico = useCallback(() => {
    return Date.now() + Math.floor(Math.random() * 1000);
  }, []);

  // Crear flujo activo desde solicitud aprobada
  const crearFlujoDesde = useCallback((
    solicitud_id: number, 
    datos_solicitud?: DatosSolicitud, 
    campos_dinamicos?: RelacionInput[] | CamposDinamicos,
    plantilla_id?: number
  ): FlujoActivo => {
    console.log('🌊 CREANDO FLUJO DESDE SOLICITUD:', { 
      solicitud_id, 
      plantilla_id, 
      tiene_datos: !!datos_solicitud,
      tiene_campos: !!campos_dinamicos 
    });
    
    const nuevoFlujo: FlujoActivo = {
      id_flujo_activo: generarIdUnico(),
      solicitud_id,
      flujo_ejecucion_id: plantilla_id,
      estado: 'encurso',
      fecha_inicio: new Date(),
      datos_solicitud,
      campos_dinamicos
    };
    
    console.log('🌊 FLUJO CREADO:', nuevoFlujo);
    
    setFlujosActivos(prev => [...prev, nuevoFlujo]);
    
    // Generar pasos de diagrama automáticamente (se hará después de definir la función)
    const plantilla = plantilla_id ? plantillasFlujo.find(p => p.id_plantilla === plantilla_id) : undefined;
    
    // Si hay plantilla, crear pasos de ejecución también
    if (plantilla) {
      crearPasosDesde(nuevoFlujo.id_flujo_activo, plantilla);
    } else {
      crearPasoBasico(nuevoFlujo.id_flujo_activo);
    }
    
    // Crear pasos después del return para evitar dependencia circular
    setTimeout(() => {
      const nuevosId = Date.now();
      if (plantilla && plantilla.pasos.length > 0) {
        const pasos = plantilla.pasos.map((pasoPlantilla, index) => ({
          id_paso_solicitud: nuevosId + index,
          flujo_activo_id: nuevoFlujo.id_flujo_activo,
          paso_id: pasoPlantilla.id_paso,
          estado: 'pendiente' as const,
          fecha_inicio: new Date(),
          nombre: pasoPlantilla.nombre,
          descripcion: pasoPlantilla.descripcion,
          posicion_x: 100 + (index * 250),
          posicion_y: 100,
          tipo: index === 0 ? 'inicio' as const : 
                index === plantilla.pasos.length - 1 ? 'fin' as const : 'proceso' as const,
          tipo_paso: pasoPlantilla.tipo === 'aprobacion' ? 'aprobacion' as const : 'ejecucion' as const,
          tipo_flujo: 'normal' as const, // Por defecto flujo normal
          regla_aprobacion: 'unanime' as const, // Por defecto aprobación unánime
          campos_dinamicos: index === 0 ? campos_dinamicos : undefined // Solo el paso inicial tiene los campos dinámicos
        }));
        
        setPasosSolicitud(prev => [...prev, ...pasos]);
        
        // Crear caminos
        const caminos: CaminoParalelo[] = [];
        for (let i = 0; i < pasos.length - 1; i++) {
          caminos.push({
            id_camino: Date.now() + i + Math.random() * 100,
            paso_origen_id: pasos[i].id_paso_solicitud,
            paso_destino_id: pasos[i + 1].id_paso_solicitud,
            es_excepcion: false,
            nombre: `Paso ${i + 1} → ${i + 2}`
          });
        }
        setCaminosParalelos(prev => [...prev, ...caminos]);
      } else {
        // Crear solo paso inicial sin plantilla - permite agregar más pasos dinámicamente
        const pasoInicial: PasoSolicitud = {
          id_paso_solicitud: nuevosId,
          flujo_activo_id: nuevoFlujo.id_flujo_activo,
          estado: 'pendiente',
          fecha_inicio: new Date(),
          nombre: 'Inicio - Revisar Solicitud',
          descripcion: 'Revisar datos de la solicitud y campos dinámicos',
          posicion_x: 300,
          posicion_y: 200,
          tipo: 'inicio',
          tipo_paso: 'ejecucion' as const,
          tipo_flujo: 'normal' as const, // Por defecto flujo normal
          regla_aprobacion: 'unanime' as const, // Por defecto aprobación unánime
          campos_dinamicos: campos_dinamicos // Asignar campos dinámicos al paso inicial
        };
        
        setPasosSolicitud(prev => [...prev, pasoInicial]);
      }
    }, 0);
    
    return nuevoFlujo;
  }, [generarIdUnico, plantillasFlujo]);

  // Crear pasos desde plantilla
  const crearPasosDesde = useCallback((flujo_activo_id: number, plantilla: PlantillaFlujo) => {
    const nuevasPasos = plantilla.pasos.map(paso => ({
      id_ejecucion: generarIdUnico(),
      flujo_activo_id,
      paso_id: paso.id_paso,
      nombre: paso.nombre,
      estado: 'pendiente' as const,
    }));
    
    setEjecucionesPasos(prev => [...prev, ...nuevasPasos]);
    console.log('📋 PASOS CREADOS DESDE PLANTILLA:', nuevasPasos.length);
  }, [generarIdUnico]);

  // Crear paso básico cuando no hay plantilla
  const crearPasoBasico = useCallback((flujo_activo_id: number) => {
    const pasoBasico: EjecucionPaso = {
      id_ejecucion: generarIdUnico(),
      flujo_activo_id,
      nombre: 'Procesamiento de Solicitud',
      estado: 'pendiente'
    };
    
    setEjecucionesPasos(prev => [...prev, pasoBasico]);
    console.log('📝 PASO BÁSICO CREADO');
  }, [generarIdUnico]);

  // Actualizar estado de flujo
  const actualizarEstadoFlujo = useCallback((flujo_id: number, nuevoEstado: EstadoFlujo) => {
    setFlujosActivos(prev => prev.map(flujo => 
      flujo.id_flujo_activo === flujo_id 
        ? { 
            ...flujo, 
            estado: nuevoEstado,
            fecha_finalizacion: nuevoEstado !== 'encurso' ? new Date() : undefined
          }
        : flujo
    ));
    
    console.log('🔄 ESTADO FLUJO ACTUALIZADO:', { flujo_id, nuevoEstado });
  }, []);

  // Actualizar estado de paso
  const actualizarEstadoPaso = useCallback((
    ejecucion_id: number, 
    nuevoEstado: EjecucionPaso['estado'],
    resultado?: ResultadoPaso
  ) => {
    setEjecucionesPasos(prev => prev.map(ejecucion => 
      ejecucion.id_ejecucion === ejecucion_id 
        ? { 
            ...ejecucion, 
            estado: nuevoEstado,
            fecha_inicio: nuevoEstado === 'enprogreso' && !ejecucion.fecha_inicio ? new Date() : ejecucion.fecha_inicio,
            fecha_finalizacion: ['completado', 'fallido'].includes(nuevoEstado) ? new Date() : undefined,
            resultado
          }
        : ejecucion
    ));
    
    console.log('📝 ESTADO PASO ACTUALIZADO:', { ejecucion_id, nuevoEstado });
  }, []);

  // Obtener flujo por solicitud
  const obtenerFlujoPorSolicitud = useCallback((solicitud_id: number): FlujoActivo | undefined => {
    return flujosActivos.find(flujo => flujo.solicitud_id === solicitud_id);
  }, [flujosActivos]);

  // Obtener pasos de un flujo
  const obtenerPasosDeFlujo = useCallback((flujo_activo_id: number): EjecucionPaso[] => {
    return ejecucionesPasos.filter(ejecucion => ejecucion.flujo_activo_id === flujo_activo_id);
  }, [ejecucionesPasos]);

  // Verificar si puede finalizar flujo
  const puedeFinalizarFlujo = useCallback((flujo_activo_id: number): boolean => {
    const pasos = obtenerPasosDeFlujo(flujo_activo_id);
    return pasos.length > 0 && pasos.every(paso => paso.estado === 'completado');
  }, [obtenerPasosDeFlujo]);

  // Finalizar flujo automáticamente si todos los pasos están completos
  const verificarFinalizacion = useCallback((flujo_activo_id: number) => {
    if (puedeFinalizarFlujo(flujo_activo_id)) {
      actualizarEstadoFlujo(flujo_activo_id, 'finalizado');
      console.log('✅ FLUJO FINALIZADO AUTOMÁTICAMENTE:', flujo_activo_id);
    }
  }, [puedeFinalizarFlujo, actualizarEstadoFlujo]);

  // Obtener estadísticas
  const obtenerEstadisticas = useCallback((): EstadisticasFlujos => {
    const total = flujosActivos.length;
    const en_curso = flujosActivos.filter(f => f.estado === 'encurso').length;
    const finalizados = flujosActivos.filter(f => f.estado === 'finalizado').length;
    const cancelados = flujosActivos.filter(f => f.estado === 'cancelado').length;
    
    return {
      total_flujos: total,
      en_curso,
      finalizados,
      cancelados
    };
  }, [flujosActivos]);

  // Crear plantilla de flujo
  const crearPlantilla = useCallback((nombre: string, descripcion?: string): PlantillaFlujo => {
    const nuevaPlantilla: PlantillaFlujo = {
      id_plantilla: generarIdUnico(),
      nombre,
      descripcion,
      pasos: [],
      fecha_creacion: new Date()
    };
    
    setPlantillasFlujo(prev => [...prev, nuevaPlantilla]);
    return nuevaPlantilla;
  }, [generarIdUnico]);

  // Generar pasos para diagrama
  const generarPasosSolicitud = useCallback((flujo_activo_id: number, plantilla?: PlantillaFlujo): PasoSolicitud[] => {
    const nuevosId = Date.now();
    
    if (plantilla && plantilla.pasos.length > 0) {
      // Crear pasos desde plantilla
      const pasos = plantilla.pasos.map((pasoPlantilla, index) => ({
        id_paso_solicitud: nuevosId + index,
        flujo_activo_id,
        paso_id: pasoPlantilla.id_paso,
        estado: 'pendiente' as const,
        fecha_inicio: new Date(),
        nombre: pasoPlantilla.nombre,
        descripcion: pasoPlantilla.descripcion,
        posicion_x: 100 + (index * 250),
        posicion_y: 100,
        tipo: index === 0 ? 'inicio' as const : 
              index === plantilla.pasos.length - 1 ? 'fin' as const : 'proceso' as const,
        tipo_paso: pasoPlantilla.tipo === 'aprobacion' ? 'aprobacion' as const : 'ejecucion' as const,
        tipo_flujo: 'normal' as const, // Por defecto flujo normal
        regla_aprobacion: 'unanime' as const // Por defecto aprobación unánime
      }));
      
      setPasosSolicitud(prev => [...prev, ...pasos]);
      generarCaminosBasicos(pasos);
      return pasos;
    } else {
      // Crear pasos básicos sin plantilla
      const pasosBasicos: PasoSolicitud[] = [
        {
          id_paso_solicitud: nuevosId,
          flujo_activo_id,
          estado: 'pendiente',
          fecha_inicio: new Date(),
          nombre: 'Inicio del Proceso',
          posicion_x: 100,
          posicion_y: 100,
          tipo: 'inicio',
          tipo_paso: 'ejecucion' as const,
          tipo_flujo: 'normal' as const,
          regla_aprobacion: 'unanime' as const
        },
        {
          id_paso_solicitud: nuevosId + 1,
          flujo_activo_id,
          estado: 'pendiente',
          fecha_inicio: new Date(),
          nombre: 'Revisión y Procesamiento',
          posicion_x: 350,
          posicion_y: 100,
          tipo: 'proceso',
          tipo_paso: 'aprobacion' as const,
          tipo_flujo: 'normal' as const,
          regla_aprobacion: 'unanime' as const
        },
        {
          id_paso_solicitud: nuevosId + 2,
          flujo_activo_id,
          estado: 'pendiente',
          fecha_inicio: new Date(),
          nombre: 'Finalización',
          posicion_x: 600,
          posicion_y: 100,
          tipo: 'fin',
          tipo_paso: 'ejecucion' as const,
          tipo_flujo: 'normal' as const,
          regla_aprobacion: 'unanime' as const
        }
      ];
      
      setPasosSolicitud(prev => [...prev, ...pasosBasicos]);
      generarCaminosBasicos(pasosBasicos);
      return pasosBasicos;
    }
  }, [plantillasFlujo]);

  // Generar caminos básicos
  const generarCaminosBasicos = useCallback((pasos: PasoSolicitud[]) => {
    const caminos: CaminoParalelo[] = [];
    
    for (let i = 0; i < pasos.length - 1; i++) {
      caminos.push({
        id_camino: Date.now() + i + Math.random() * 100,
        paso_origen_id: pasos[i].id_paso_solicitud,
        paso_destino_id: pasos[i + 1].id_paso_solicitud,
        es_excepcion: false,
        nombre: `Paso ${i + 1} → ${i + 2}`
      });
    }
    
    setCaminosParalelos(prev => [...prev, ...caminos]);
  }, []);

  // Actualizar paso de solicitud
  const actualizarPasoSolicitud = useCallback((pasoId: number, estado: PasoSolicitud['estado'], responsableId?: number) => {
    setPasosSolicitud(prev => prev.map(paso => 
      paso.id_paso_solicitud === pasoId 
        ? { 
            ...paso, 
            estado, 
            responsable_id: responsableId,
            fecha_finalizacion: estado !== 'pendiente' ? new Date() : undefined
          }
        : paso
    ));
  }, []);

  // Editar paso completo MEJORADO CON FORZADO DE ACTUALIZACIÓN
  const editarPasoSolicitud = useCallback((pasoActualizado: PasoSolicitud) => {
    console.log('🔄 EDITANDO PASO:', pasoActualizado.id_paso_solicitud, { 
      nueva_x: pasoActualizado.posicion_x, 
      nueva_y: pasoActualizado.posicion_y 
    });
    
    setPasosSolicitud(prev => {
      const nuevoPasos = prev.map(paso => 
        paso.id_paso_solicitud === pasoActualizado.id_paso_solicitud 
          ? { ...paso, ...pasoActualizado }
          : paso
      );
      console.log('📝 PASOS ACTUALIZADOS:', nuevoPasos.find(p => p.id_paso_solicitud === pasoActualizado.id_paso_solicitud));
      return nuevoPasos;
    });
  }, []);

  // Asignar responsable basado en rol/departamento
  const asignarResponsableAutomatico = useCallback((pasoId: number, tipoPaso: 'ejecucion' | 'aprobacion') => {
    // Simulación de lógica de asignación automática
    const responsablesDisponibles = [
      { id: 1, rol: 'supervisor', departamento: 'operaciones', tipo_preferido: 'ejecucion' },
      { id: 2, rol: 'gerente', departamento: 'finanzas', tipo_preferido: 'aprobacion' },
      { id: 3, rol: 'analista', departamento: 'calidad', tipo_preferido: 'ejecucion' },
      { id: 4, rol: 'director', departamento: 'general', tipo_preferido: 'aprobacion' }
    ];

    const responsableAsignado = responsablesDisponibles.find(r => r.tipo_preferido === tipoPaso);
    
    if (responsableAsignado) {
      actualizarPasoSolicitud(pasoId, 'pendiente', responsableAsignado.id);
      console.log(`📋 Responsable asignado automáticamente: ${responsableAsignado.rol} (ID: ${responsableAsignado.id})`);
    }
  }, [actualizarPasoSolicitud]);

  // Crear camino entre pasos REALMENTE ARREGLADO
  const crearCamino = useCallback((origen_id: number, destino_id: number, es_excepcion = false, condicion?: string) => {
    // Verificar que no exista ya una conexión
    const existeConexion = caminosParalelos.some(camino => 
      camino.paso_origen_id === origen_id && camino.paso_destino_id === destino_id
    );
    
    if (existeConexion) {
      console.log('⚠️ Ya existe una conexión entre estos pasos');
      return null;
    }
    
    const nuevoCamino: CaminoParalelo = {
      id_camino: Date.now() + Math.random() * 1000,
      paso_origen_id: origen_id,
      paso_destino_id: destino_id,
      es_excepcion,
      condicion,
      nombre: es_excepcion ? 'Excepción' : `Paso ${origen_id} → ${destino_id}`
    };
    
    console.log('🔗 CREANDO NUEVO CAMINO:', nuevoCamino);
    setCaminosParalelos(prev => {
      const nuevoCaminos = [...prev, nuevoCamino];
      console.log('🔗 CAMINOS ACTUALIZADOS:', nuevoCaminos.length);
      return nuevoCaminos;
    });
    return nuevoCamino;
  }, [caminosParalelos]);

  // Crear ruta alternativa (excepción)
  const crearRutaAlternativa = useCallback((pasoOrigenId: number, pasoDestinoId: number, condicion?: string) => {
    return crearCamino(pasoOrigenId, pasoDestinoId, true, condicion);
  }, [crearCamino]);

  // Generar pasos automáticos desde plantilla mejorado
  const generarPasosDesdeTemplate = useCallback((flujo_activo_id: number, plantilla: PlantillaFlujo) => {
    const nuevosId = Date.now();
    
    const pasos = plantilla.pasos.map((pasoPlantilla, index) => {
      const nuevoPaso: PasoSolicitud = {
        id_paso_solicitud: nuevosId + index,
        flujo_activo_id,
        paso_id: pasoPlantilla.id_paso,
        estado: 'pendiente',
        fecha_inicio: new Date(),
        nombre: pasoPlantilla.nombre,
        descripcion: pasoPlantilla.descripcion,
        posicion_x: 100 + (index * 300),
        posicion_y: 100 + (Math.floor(index / 3) * 200), // Distribución en grid
        tipo: index === 0 ? 'inicio' : 
              index === plantilla.pasos.length - 1 ? 'fin' : 'proceso',
        tipo_paso: pasoPlantilla.tipo === 'aprobacion' ? 'aprobacion' : 'ejecucion',
        tipo_flujo: 'normal' as const, // Por defecto flujo normal
        regla_aprobacion: pasoPlantilla.tipo === 'aprobacion' ? 'unanime' as const : 'unanime' as const
      };

      // Asignar responsable automáticamente
      setTimeout(() => asignarResponsableAutomatico(nuevoPaso.id_paso_solicitud, nuevoPaso.tipo_paso), 100);
      
      return nuevoPaso;
    });
    
    setPasosSolicitud(prev => [...prev, ...pasos]);
    
    // Generar caminos secuenciales y paralelos si es necesario
    const caminos: CaminoParalelo[] = [];
    
    // Caminos secuenciales básicos
    for (let i = 0; i < pasos.length - 1; i++) {
      caminos.push({
        id_camino: Date.now() + i + Math.random() * 100,
        paso_origen_id: pasos[i].id_paso_solicitud,
        paso_destino_id: pasos[i + 1].id_paso_solicitud,
        es_excepcion: false,
        nombre: `${pasos[i].nombre} → ${pasos[i + 1].nombre}`
      });
    }
    
    // Agregar rutas de excepción si hay pasos de aprobación
    pasos.forEach((paso, index) => {
      if (paso.tipo_paso === 'aprobacion' && index < pasos.length - 1) {
        // Crear camino de excepción para rechazo
        const pasoFin = pasos[pasos.length - 1];
        caminos.push({
          id_camino: Date.now() + index + 1000 + Math.random() * 100,
          paso_origen_id: paso.id_paso_solicitud,
          paso_destino_id: pasoFin.id_paso_solicitud,
          es_excepcion: true,
          condicion: 'rechazado',
          nombre: `Rechazo: ${paso.nombre} → Fin`
        });
      }
    });
    
    setCaminosParalelos(prev => [...prev, ...caminos]);
    
    console.log(`🔄 Generados ${pasos.length} pasos y ${caminos.length} caminos desde plantilla`);
    return pasos;
  }, [asignarResponsableAutomatico, crearCamino]);

  // Obtener pasos de solicitud por flujo
  const obtenerPasosSolicitudPorFlujo = useCallback((flujo_activo_id: number): PasoSolicitud[] => {
    return pasosSolicitud.filter(paso => paso.flujo_activo_id === flujo_activo_id);
  }, [pasosSolicitud]);

  // Obtener caminos por flujo ARREGLADO
  const obtenerCaminosPorFlujo = useCallback((flujo_activo_id: number): CaminoParalelo[] => {
    const pasosFlujo = obtenerPasosSolicitudPorFlujo(flujo_activo_id);
    const idsSteps = pasosFlujo.map(p => p.id_paso_solicitud);
    
    // Buscar caminos que conecten pasos de este flujo
    const caminosFiltrados = caminosParalelos.filter(camino => {
      const origenEnFlujo = idsSteps.includes(camino.paso_origen_id);
      const destinoEnFlujo = idsSteps.includes(camino.paso_destino_id);
      return origenEnFlujo && destinoEnFlujo;
    });
    
    console.log('🔗 CAMINOS PARA FLUJO:', flujo_activo_id, {
      pasos_ids: idsSteps,
      caminos_totales: caminosParalelos.length,
      caminos_filtrados: caminosFiltrados.length,
      caminos: caminosFiltrados.map(c => ({
        id: c.id_camino,
        origen: c.paso_origen_id,
        destino: c.paso_destino_id,
        nombre: c.nombre
      }))
    });
    
    return caminosFiltrados;
  }, [pasosSolicitud, caminosParalelos, obtenerPasosSolicitudPorFlujo]);

  // Agregar nuevo paso al diagrama
  const agregarPasoAlDiagrama = useCallback((flujo_activo_id: number, x: number, y: number, tipo_paso: 'ejecucion' | 'aprobacion' = 'ejecucion', tipo: PasoSolicitud['tipo'] = 'proceso') => {
    const nuevoPaso: PasoSolicitud = {
      id_paso_solicitud: Date.now() + Math.random() * 1000,
      flujo_activo_id,
      estado: 'pendiente',
      fecha_inicio: new Date(),
      nombre: `Nuevo ${tipo_paso}`,
      posicion_x: x,
      posicion_y: y,
      tipo,
      tipo_paso,
      tipo_flujo: 'normal' as const, // Por defecto flujo normal
      regla_aprobacion: 'unanime' as const // Por defecto aprobación unánime
    };
    
    setPasosSolicitud(prev => [...prev, nuevoPaso]);
    return nuevoPaso;
  }, []);


  return {
    // Estado
    flujosActivos,
    plantillasFlujo,
    ejecucionesPasos,
    pasosSolicitud,
    caminosParalelos,
    
    // Funciones principales
    crearFlujoDesde,
    actualizarEstadoFlujo,
    actualizarEstadoPaso,
    
    // Consultas
    obtenerFlujoPorSolicitud,
    obtenerPasosDeFlujo,
    obtenerEstadisticas,
    
    // Funciones de pasos de diagrama
    generarPasosSolicitud,
    actualizarPasoSolicitud,
    editarPasoSolicitud,
    obtenerPasosSolicitudPorFlujo,
    obtenerCaminosPorFlujo,
    agregarPasoAlDiagrama,
    crearCamino,
    crearRutaAlternativa,
    asignarResponsableAutomatico,
    generarPasosDesdeTemplate,
    
    // Utilidades
    puedeFinalizarFlujo,
    verificarFinalizacion,
    crearPlantilla
  };
};