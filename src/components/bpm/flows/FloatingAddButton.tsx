import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Users, FileText, X } from 'lucide-react';

interface FloatingAddButtonProps {
  onAddPaso: (tipo: 'aprobacion' | 'ejecucion') => void;
  disabled?: boolean;
}

export const FloatingAddButton: React.FC<FloatingAddButtonProps> = ({
  onAddPaso,
  disabled = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleAddPaso = (tipo: 'aprobacion' | 'ejecucion') => {
    onAddPaso(tipo);
    setIsExpanded(false);
  };

  return (
    <div className="absolute top-6 left-6 z-50">
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-16 left-0 mt-2"
          >
            <Card className="p-3 shadow-soft bg-white border">
              <div className="flex flex-col gap-2 min-w-[180px]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Agregar Paso:</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsExpanded(false)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
                
                <Button
                  onClick={() => handleAddPaso('aprobacion')}
                  variant="outline"
                  size="sm"
                  className="justify-start gap-2 hover:bg-primary/10 hover:border-primary transition-all duration-300"
                  disabled={disabled}
                >
                  <Users className="w-4 h-4 text-orange-600" />
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Aprobación</span>
                    <span className="text-xs text-muted-foreground">Requiere aprobación</span>
                  </div>
                </Button>
                
                <Button
                  onClick={() => handleAddPaso('ejecucion')}
                  variant="outline"
                  size="sm"
                  className="justify-start gap-2 hover:bg-primary/10 hover:border-primary transition-all duration-300"
                  disabled={disabled}
                >
                  <FileText className="w-4 h-4 text-blue-600" />
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Ejecución</span>
                    <span className="text-xs text-muted-foreground">Tarea a completar</span>
                  </div>
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.div
        animate={{ rotate: isExpanded ? 45 : 0 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
      >
        <Button
          onClick={() => setIsExpanded(!isExpanded)}
          variant="outline"
          className="h-12 w-12 rounded-full shadow-lg hover:bg-primary/10 hover:border-primary hover:scale-105 transition-all duration-300"
          disabled={disabled}
        >
          <Plus className="w-5 h-5" />
        </Button>
      </motion.div>
    </div>
  );
};
