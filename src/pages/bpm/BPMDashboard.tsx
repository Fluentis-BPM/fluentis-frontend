import React, { useState } from 'react';
import { ModuloSolicitudes } from '@/components/bpm/requests/ModuloSolicitudes';
import { ModuloFlujos } from '@/components/bpm/flows/ModuloFlujos';
import { useSolicitudes } from '@/hooks/bpm/useSolicitudes';
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
  const [activeTab, setActiveTab] = useState('overview');

  const stats = {
    totalSolicitudes: solicitudesData.solicitudes.length,
    solicitudesAprobadas: solicitudesData.filtrarPorEstado('aprobado').length,
    solicitudesPendientes: solicitudesData.filtrarPorEstado('pendiente').length,
    solicitudesRechazadas: solicitudesData.filtrarPorEstado('rechazado').length,
    flujosActivos: solicitudesData.flujosActivos.length,
    flujosEnCurso: solicitudesData.flujosActivos.filter(f => f.estado === 'encurso').length
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Business Process Management
          </h1>
          <p className="text-lg text-muted-foreground mt-2">
            Gestión integral de solicitudes y flujos de trabajo automatizados
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          Sistema Fluentis BPM
        </Badge>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Solicitudes</CardTitle>
            <FileText className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalSolicitudes}</div>
            <p className="text-xs text-muted-foreground">Registradas en el sistema</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprobadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.solicitudesAprobadas}</div>
            <p className="text-xs text-muted-foreground">Con flujos activos</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.solicitudesPendientes}</div>
            <p className="text-xs text-muted-foreground">Esperando aprobación</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flujos Activos</CardTitle>
            <Workflow className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.flujosEnCurso}</div>
            <p className="text-xs text-muted-foreground">En ejecución</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Resumen
          </TabsTrigger>
          <TabsTrigger value="solicitudes" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Solicitudes
          </TabsTrigger>
          <TabsTrigger value="flujos" className="flex items-center gap-2">
            <Workflow className="w-4 h-4" />
            Flujos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Proceso de Solicitudes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
                    <span className="font-medium">Crear Solicitud</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-blue-500" />
                </div>
                
                <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white text-sm font-bold">2</div>
                    <span className="font-medium">Proceso de Aprobación</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-yellow-500" />
                </div>
                
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">3</div>
                    <span className="font-medium">Flujo Automatizado</span>
                  </div>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Workflow className="w-5 h-5" />
                  Tipos de Flujo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Flujos Secuenciales</span>
                    <Badge variant="outline">Normal</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Flujos con Bifurcación</span>
                    <Badge variant="outline">Paralelo</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Flujos de Aprobación</span>
                    <Badge variant="outline">Aprobación</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Flujos de Ejecución</span>
                    <Badge variant="outline">Ejecución</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="solicitudes" className="space-y-4">
          <ModuloSolicitudes 
            solicitudesData={solicitudesData}
            onNavigateToFlujos={() => setActiveTab('flujos')}
          />
        </TabsContent>

        <TabsContent value="flujos" className="space-y-4">
          <ModuloFlujos solicitudesData={solicitudesData} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
