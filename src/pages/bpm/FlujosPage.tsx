import React from 'react';
import { motion } from 'motion/react';
import { ModuloFlujos } from '@/components/bpm/flows/ModuloFlujos';

export const FlujosPage: React.FC = () => {
  return (
    <main className="flex-1 overflow-auto bg-[#eaf3fa] min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="h-full"
      >
        <ModuloFlujos />
      </motion.div>
    </main>
  );
};

export default FlujosPage;
