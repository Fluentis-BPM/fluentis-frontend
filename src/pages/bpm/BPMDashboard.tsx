import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ModuloSolicitudes } from '@/components/bpm/requests/ModuloSolicitudes';
import { ModuloFlujos } from '@/components/bpm/flows/ModuloFlujos';
import { useSolicitudes } from '@/hooks/bpm/useSolicitudes';
import { useBpm } from '@/hooks/bpm/useBpm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Workflow, 
  FileText, 
  BarChart3,
  ArrowRight,
  CheckCircle,
  Clock
} from 'lucide-react';

export const BPMDashboard: React.FC = () => {
  const solicitudesData = useSolicitudes();
  const { flujosActivos, loadFlujosActivos } = useBpm();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Best-effort fetch; hook also auto-loads when authenticated
    try { solicitudesData.cargarSolicitudes(); } catch { /* noop */ }
    // Load active flows using the same source as the Flujos module to keep counters consistent
    try { loadFlujosActivos(); } catch { /* noop */ }
  }, [loadFlujosActivos]);

  // Derive counts; active flows should match what the Flujos section displays (length of flujosActivos array)
  const stats = {
    totalSolicitudes: solicitudesData.solicitudes.length,
    solicitudesAprobadas: solicitudesData.filtrarPorEstado('aprobado').length,
    solicitudesPendientes: solicitudesData.filtrarPorEstado('pendiente').length,
    solicitudesRechazadas: solicitudesData.filtrarPorEstado('rechazado').length,
    flujosActivos: flujosActivos.length,
    flujosEnCurso: flujosActivos.filter(f => f.estado === 'encurso').length,
  };

  return (
    <main className="flex-1 overflow-auto bg-[#eaf3fa] p-0 min-h-screen">
      <div className="max-w-5xl mx-auto pt-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#1a4e8a] tracking-tight">Business Process Management</h1>
          <p className="text-base text-[#6b7a90] mt-1">Gestión integral de solicitudes y flujos de trabajo automatizados</p>
        </div>

        {/* Overview Stats con animaciones */}
        <div className="overflow-hidden rounded-xl border border-[#dbe7f3] bg-white shadow-lg p-0 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              whileHover={{ y: -2, scale: 1.02 }}
              className="border-r border-[#eaf3fa] p-6 flex flex-col items-center justify-center"
            >
              <FileText className="h-8 w-8 text-[#1a4e8a] mb-2" />
              <div className="text-2xl font-bold text-[#1a4e8a]">{stats.totalSolicitudes}</div>
              <div className="text-xs text-[#6b7a90] mt-1">Solicitudes registradas</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              whileHover={{ y: -2, scale: 1.02 }}
              className="border-r border-[#eaf3fa] p-6 flex flex-col items-center justify-center"
            >
              <CheckCircle className="h-8 w-8 text-green-600 mb-2" />
              <div className="text-2xl font-bold text-green-600">{stats.solicitudesAprobadas}</div>
              <div className="text-xs text-[#6b7a90] mt-1">Aprobadas</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              whileHover={{ y: -2, scale: 1.02 }}
              className="border-r border-[#eaf3fa] p-6 flex flex-col items-center justify-center"
            >
              <Clock className="h-8 w-8 text-yellow-500 mb-2" />
              <div className="text-2xl font-bold text-yellow-600">{stats.solicitudesPendientes}</div>
              <div className="text-xs text-[#6b7a90] mt-1">Pendientes</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              whileHover={{ y: -2, scale: 1.02 }}
              className="p-6 flex flex-col items-center justify-center"
            >
              <Workflow className="h-8 w-8 text-purple-600 mb-2" />
              <div className="text-2xl font-bold text-purple-600">{stats.flujosActivos}</div>
              <div className="text-xs text-[#6b7a90] mt-1">Flujos activos</div>
            </motion.div>
          </div>
        </div>

        {/* Main Content Tabs */}
        <div className="rounded-xl border border-[#dbe7f3] bg-white shadow-lg overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-[#f6fafd] rounded-none border-b border-[#eaf3fa] h-auto">
              <TabsTrigger value="overview" className="flex items-center gap-2 text-[#1a4e8a] px-4 py-4 font-medium rounded-none data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-[#1a4e8a]">
                <BarChart3 className="w-4 h-4" />
                Resumen
              </TabsTrigger>
              <TabsTrigger value="solicitudes" className="flex items-center gap-2 text-[#1a4e8a] px-4 py-4 font-medium rounded-none data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-[#1a4e8a]">
                <FileText className="w-4 h-4" />
                Solicitudes
              </TabsTrigger>
              <TabsTrigger value="flujos" className="flex items-center gap-2 text-[#1a4e8a] px-4 py-4 font-medium rounded-none data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-[#1a4e8a]">
                <Workflow className="w-4 h-4" />
                Flujos
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 p-8 m-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="border-none shadow-none bg-[#f6fafd]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-[#1a4e8a]">
                      <FileText className="w-5 h-5" />
                      Proceso de Solicitudes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-[#eaf3fa] rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#1a4e8a] rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
                        <span className="font-medium text-[#1a4e8a]">Crear Solicitud</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#1a4e8a]" />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-[#f6fafd] rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white text-sm font-bold">2</div>
                        <span className="font-medium text-[#6b7a90]">Proceso de Aprobación</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-yellow-500" />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-[#eaf3fa] rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold">3</div>
                        <span className="font-medium text-green-600">Flujo Automatizado</span>
                      </div>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-none bg-[#f6fafd]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-[#1a4e8a]">
                      <Workflow className="w-5 h-5" />
                      Tipos de Flujo
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-[#1a4e8a]">Flujos Secuenciales</span>
                        <Badge variant="outline" className="bg-[#eaf3fa] text-[#1a4e8a]">Normal</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-[#1a4e8a]">Flujos con Bifurcación</span>
                        <Badge variant="outline" className="bg-[#eaf3fa] text-[#1a4e8a]">Paralelo</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-[#1a4e8a]">Flujos de Aprobación</span>
                        <Badge variant="outline" className="bg-[#eaf3fa] text-[#1a4e8a]">Aprobación</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-[#1a4e8a]">Flujos de Ejecución</span>
                        <Badge variant="outline" className="bg-[#eaf3fa] text-[#1a4e8a]">Ejecución</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="solicitudes" className="space-y-4 p-8 m-0">
              <ModuloSolicitudes 
                solicitudesData={solicitudesData}
                onNavigateToFlujos={() => setActiveTab('flujos')}
              />
            </TabsContent>

            <TabsContent value="flujos" className="space-y-4 p-8 m-0">
              <ModuloFlujos/>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  );
};
