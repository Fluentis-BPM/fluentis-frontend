import React, { useState } from "react";
import { ModuloSolicitudes } from "@/components/bpm-requests/ModuloSolicitudes";
import { ModuloFlujos } from "@/components/bpm-flows/ModuloFlujos";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/bpm-ui/tabs";
import { Layers, Workflow } from "lucide-react";
import { useSolicitudes } from "@/hooks/bpm/useSolicitudes";

const Index = () => {
  const [activeTab, setActiveTab] = useState("solicitudes");
  const solicitudesData = useSolicitudes(); // Instancia única compartida
  return (
    <div className="min-h-screen bg-background">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-6 py-4">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="solicitudes" className="flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Solicitudes
              </TabsTrigger>
              <TabsTrigger value="flujos" className="flex items-center gap-2">
                <Workflow className="w-4 h-4" />
                Flujos
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent value="solicitudes" className="m-0">
          <ModuloSolicitudes 
            solicitudesData={solicitudesData}
            onNavigateToFlujos={() => setActiveTab("flujos")}
          />
        </TabsContent>

        <TabsContent value="flujos" className="m-0">
          <ModuloFlujos solicitudesData={solicitudesData} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;
