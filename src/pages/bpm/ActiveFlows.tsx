import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Workflow, CheckCircle, Clock } from 'lucide-react';
// import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';

// Interfaz parcial para los datos relevantes del flujo activo
interface Flow {
  idFlujoActivo: number;
  nombre: string;
  estado: string;
  fechaInicio: string;
  solicitud?: {
    solicitante?: {
      nombre?: string;
    };
  };
}

const ActiveFlows: React.FC = () => {
  const [flows, setFlows] = useState<Flow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    /*
    axios.get('/api/FlujosActivos')
      .then(res => {
        const data = res.data;
        if (Array.isArray(data)) {
          setFlows(data);
        } else if (Array.isArray(data?.items)) {
          setFlows(data.items);
        } else {
          setError('La respuesta del servidor no es válida.');
        }
        setLoading(false);
      })
      .catch(() => {
        setError('No se pudieron cargar los flujos activos.');
        setLoading(false);
      });
    */

    // Datos simulados
    const mockFlows = [
      {
        idFlujoActivo: 1,
        nombre: 'Aprobación de compra',
        estado: 'EnCurso',
        fechaInicio: '2025-08-01T10:00:00.000Z',
        solicitud: {
          solicitante: {
            nombre: 'Juan Pérez',
          },
        },
      },
      {
        idFlujoActivo: 2,
        nombre: 'Alta de usuario',
        estado: 'EnCurso',
        fechaInicio: '2025-08-03T14:30:00.000Z',
        solicitud: {
          solicitante: {
            nombre: 'María Gómez',
          },
        },
      },
    ];
    setFlows(mockFlows);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-40 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Flujos Activos</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.isArray(flows) && flows.length === 0 ? (
          <div className="col-span-3 text-center text-gray-500">No hay flujos activos.</div>
        ) : Array.isArray(flows) ? (
          flows.map((flow: Flow, idx: number) => (
            <motion.div
              key={flow.idFlujoActivo}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * idx, duration: 0.4 }}
              whileHover={{ y: -2, scale: 1.02 }}
            >
              <Card className="shadow-lg border border-[#dbe7f3] bg-gradient-to-br from-[#f6fafd] to-[#eaf3fa]">
                <CardHeader className="flex flex-row items-center gap-2 pb-2">
                  <Workflow className="w-6 h-6 text-[#1a4e8a]" />
                  <CardTitle className="text-[#1a4e8a] text-lg font-bold">
                    {flow.nombre || 'Sin nombre'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#6b7a90]">Estado:</span>
                    <span className={`text-sm font-medium ${flow.estado === 'EnCurso' ? 'text-yellow-600' : flow.estado === 'Aprobado' ? 'text-green-600' : 'text-[#1a4e8a]'}`}>
                      {flow.estado || 'Sin estado'}
                      {flow.estado === 'EnCurso' && <Clock className="inline ml-1 w-4 h-4 text-yellow-600" />}
                      {flow.estado === 'Aprobado' && <CheckCircle className="inline ml-1 w-4 h-4 text-green-600" />}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#6b7a90]">Inicio:</span>
                    <span className="text-sm text-[#1a4e8a]">{flow.fechaInicio ? new Date(flow.fechaInicio).toLocaleDateString() : 'Sin fecha'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#6b7a90]">Responsable:</span>
                    <span className="text-sm text-[#1a4e8a]">{flow.solicitud?.solicitante?.nombre || 'Sin responsable'}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        ) : (
          <div className="col-span-3 text-center text-red-500">La respuesta del servidor no es válida.</div>
        )}
      </div>
    </div>
  );
};

export default ActiveFlows;
