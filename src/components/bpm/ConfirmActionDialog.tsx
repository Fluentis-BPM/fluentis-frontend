import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, Play, AlertTriangle, RefreshCw } from 'lucide-react';
import type { PasoSolicitud } from '@/types/bpm/paso';

interface ConfirmActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paso: PasoSolicitud | null;
  accion: 'aprobar' | 'rechazar' | 'ejecutar';
  onConfirm: (comentarios?: string) => Promise<void>;
  loading?: boolean;
}

export function ConfirmActionDialog({
  open,
  onOpenChange,
  paso,
  accion,
  onConfirm,
  loading = false,
}: ConfirmActionDialogProps) {
  const [comentarios, setComentarios] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    try {
      setIsSubmitting(true);
      await onConfirm(comentarios.trim() || undefined);
      setComentarios('');
      onOpenChange(false);
    } catch (error) {
      // El error se maneja en el componente padre
      console.error('Error in confirm action:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getActionConfig = () => {
    switch (accion) {
      case 'aprobar':
        return {
          title: 'Aprobar Paso',
          description: 'Una vez aprobado, el paso continuará al siguiente nivel del flujo.',
          icon: <CheckCircle className="h-6 w-6 text-green-600" />,
          buttonText: 'Aprobar',
          buttonClass: 'bg-green-600 hover:bg-green-700 text-white',
          commentPlaceholder: 'Comentarios sobre la aprobación (opcional)',
        };
      case 'rechazar':
        return {
          title: 'Rechazar Paso',
          description: 'Una vez rechazado, el paso será devuelto o cancelado según la configuración del flujo.',
          icon: <XCircle className="h-6 w-6 text-red-600" />,
          buttonText: 'Rechazar',
          buttonClass: 'bg-red-600 hover:bg-red-700 text-white',
          commentPlaceholder: 'Motivo del rechazo (recomendado)',
        };
      case 'ejecutar':
        return {
          title: 'Ejecutar Paso',
          description: 'Una vez ejecutado, el paso será marcado como completado.',
          icon: <Play className="h-6 w-6 text-blue-600" />,
          buttonText: 'Ejecutar',
          buttonClass: 'bg-blue-600 hover:bg-blue-700 text-white',
          commentPlaceholder: 'Detalles de la ejecución (opcional)',
        };
      default:
        return {
          title: 'Confirmar Acción',
          description: '',
          icon: <AlertTriangle className="h-6 w-6" />,
          buttonText: 'Confirmar',
          buttonClass: '',
          commentPlaceholder: 'Comentarios',
        };
    }
  };

  const config = getActionConfig();

  if (!paso) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {config.icon}
            <DialogTitle>{config.title}</DialogTitle>
          </div>
          <DialogDescription>{config.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Información del paso */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <h4 className="font-medium">{paso.nombre}</h4>
            <p className="text-sm text-muted-foreground">
              Solicitud: {paso.solicitudNombre || `ID ${paso.solicitudId}`}
            </p>
            {paso.descripcion && (
              <p className="text-sm text-muted-foreground">
                {paso.descripcion}
              </p>
            )}
            <div className="flex gap-2 text-xs">
              <span className="bg-background px-2 py-1 rounded">
                Tipo: {paso.tipoPaso}
              </span>
              <span className="bg-background px-2 py-1 rounded">
                Estado: {paso.estado}
              </span>
              <span className="bg-background px-2 py-1 rounded">
                Prioridad: {paso.prioridad}
              </span>
            </div>
          </div>

          {/* Campo de comentarios */}
          <div className="space-y-2">
            <Label htmlFor="comentarios">Comentarios</Label>
            <Textarea
              id="comentarios"
              placeholder={config.commentPlaceholder}
              value={comentarios}
              onChange={(e) => setComentarios(e.target.value)}
              rows={3}
              disabled={isSubmitting || loading}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting || loading}
          >
            Cancelar
          </Button>
          <Button
            className={config.buttonClass}
            onClick={handleConfirm}
            disabled={isSubmitting || loading}
          >
            {(isSubmitting || loading) && (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            )}
            {config.buttonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface QuickActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paso: PasoSolicitud | null;
  accion: 'aprobar' | 'rechazar' | 'ejecutar';
  onConfirm: () => void;
  loading?: boolean;
}

export function QuickActionDialog({
  open,
  onOpenChange,
  paso,
  accion,
  onConfirm,
  loading = false,
}: QuickActionDialogProps) {
  const getActionConfig = () => {
    switch (accion) {
      case 'aprobar':
        return {
          title: '¿Aprobar este paso?',
          description: `Vas a aprobar el paso "${paso?.nombre}". Esta acción no se puede deshacer.`,
          buttonText: 'Aprobar',
          buttonClass: 'bg-green-600 hover:bg-green-700',
        };
      case 'rechazar':
        return {
          title: '¿Rechazar este paso?',
          description: `Vas a rechazar el paso "${paso?.nombre}". Esta acción no se puede deshacer.`,
          buttonText: 'Rechazar',
          buttonClass: 'bg-red-600 hover:bg-red-700',
        };
      case 'ejecutar':
        return {
          title: '¿Ejecutar este paso?',
          description: `Vas a ejecutar el paso "${paso?.nombre}". Esta acción lo marcará como completado.`,
          buttonText: 'Ejecutar',
          buttonClass: 'bg-blue-600 hover:bg-blue-700',
        };
      default:
        return {
          title: 'Confirmar acción',
          description: '',
          buttonText: 'Confirmar',
          buttonClass: '',
        };
    }
  };

  const config = getActionConfig();

  if (!paso) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{config.title}</AlertDialogTitle>
          <AlertDialogDescription>{config.description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            className={config.buttonClass}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
            {config.buttonText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}