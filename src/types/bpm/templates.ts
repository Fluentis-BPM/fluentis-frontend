// Tipos para Plantillas de Solicitud (alineados al backend)

export interface PlantillaInputDto {
  idPlantillaInput?: number;
  inputId: number;
  nombre?: string;
  placeHolder?: string | null;
  requerido?: boolean;
  valorPorDefecto?: string | null;
}

export interface PlantillaSolicitudDto {
  idPlantilla: number;
  nombre: string;
  descripcion?: string | null;
  flujoBaseId?: number | null;
  grupoAprobacionId?: number | null;
  fechaCreacion: string;
  inputs: PlantillaInputDto[];
}

// DTOs para API (usar PascalCase como espera el backend)
export interface PlantillaSolicitudCreateDto {
  Nombre: string;
  Descripcion?: string | null;
  FlujoBaseId?: number | null;
  GrupoAprobacionId?: number | null;
  Inputs?: Array<{
    InputId: number;
    Nombre?: string;
    PlaceHolder?: string | null;
    Requerido?: boolean;
    ValorPorDefecto?: string | null;
  }>;
}

export type PlantillaSolicitudUpdateDto = PlantillaSolicitudCreateDto;

export interface InstanciarSolicitudDesdePlantillaDto {
  PlantillaId: number;
  SolicitanteId: number;
  Nombre?: string;
  Descripcion?: string | null;
  OverridesValores?: Record<number, string>;
}

// Inputs catálogo del backend (simplificado)
export interface ApiInputCatalogItem {
  idInput: number;
  tipoInput: string;
  esJson: boolean;
}
