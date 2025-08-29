/**
 * Tipos para el sistema de inputs dinámicos
 */

export type TipoInput = 
  | 'textocorto' 
  | 'textolargo' 
  | 'combobox' 
  | 'multiplecheckbox' 
  | 'date' 
  | 'number' 
  | 'archivo';

export interface Input {
  id_input: number;
  tipo_input: TipoInput;
  etiqueta?: string;
  descripcion?: string;
  opciones?: string[]; // Para combobox y multiplecheckbox
  placeholder?: string;
  validacion?: {
    min?: number;
    max?: number;
    required?: boolean;
    pattern?: string;
  };
}

// Entidad RelacionInput (relación de inputs dinámicos con un paso)
export interface RelacionInput {
  id_relacion: number;
  input_id: number;
  nombre?: string;
  valor: string; // JSON string con el valor del campo
  placeholder?: string | null;
  requerido: boolean;
  paso_solicitud_id: number;
  // Opcional: metadata del catálogo de inputs para facilitar el renderizado
  input?: Input;
}

export interface CamposDinamicos {
  [input_id: number]: {
    valor: string;
    requerido: boolean;
  };
}

// Configuración de inputs predefinidos comunes
export const INPUT_TEMPLATES: Input[] = [
  {
    id_input: 1,
    tipo_input: 'textocorto',
    etiqueta: 'Título de la solicitud',
    placeholder: 'Ingrese un título descriptivo',
    validacion: { required: true, max: 100 }
  },
  {
    id_input: 2,
    tipo_input: 'textolargo',
    etiqueta: 'Justificación detallada',
    placeholder: 'Explique los motivos de la solicitud...',
    validacion: { required: true, max: 1000 }
  },
  {
    id_input: 3,
    tipo_input: 'combobox',
    etiqueta: 'Departamento solicitante',
    opciones: ['Recursos Humanos', 'Finanzas', 'Tecnología', 'Operaciones', 'Marketing'],
    validacion: { required: true }
  },
  {
    id_input: 4,
    tipo_input: 'date',
    etiqueta: 'Fecha requerida',
    validacion: { required: false }
  },
  {
    id_input: 5,
    tipo_input: 'number',
    etiqueta: 'Presupuesto estimado',
    placeholder: '0.00',
    validacion: { min: 0, max: 1000000 }
  },
  {
    id_input: 6,
    tipo_input: 'multiplecheckbox',
    etiqueta: 'Servicios requeridos',
    opciones: ['Consultoría', 'Desarrollo', 'Soporte', 'Capacitación', 'Documentación'],
    validacion: { required: false }
  },
  {
    id_input: 7,
    tipo_input: 'archivo',
    etiqueta: 'Documentos adjuntos',
    validacion: { required: false }
  }
];