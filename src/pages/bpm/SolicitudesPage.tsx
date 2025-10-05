import React from 'react';
import { motion } from 'motion/react';
import { ModuloSolicitudes } from '@/components/bpm/requests/ModuloSolicitudes';
import { useSolicitudes } from '@/hooks/bpm/useSolicitudes';
import { useNavigate } from 'react-router-dom';

export const SolicitudesPage: React.FC = () => {
  const solicitudesData = useSolicitudes();
  const navigate = useNavigate();

  const handleNavigateToFlujos = () => {
    navigate('/bpm/flujos');
  };

  return (
    <main className="flex-1 overflow-auto bg-[#eaf3fa] min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="h-full"
      >
        <ModuloSolicitudes 
          solicitudesData={solicitudesData}
          onNavigateToFlujos={handleNavigateToFlujos}
        />
      </motion.div>
    </main>
  );
};

export default SolicitudesPage;
