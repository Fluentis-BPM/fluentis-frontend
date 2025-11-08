export type PrioridadNotificacion = "Baja" | "Media" | "Alta" | "Critica";

export interface UsuarioMiniDto {
  idUsuario: number;
  nombre: string;
  email?: string;
}

export interface NotificacionDto {
  idNotificacion: number;
  usuarioId: number;
  mensaje: string;
  prioridad: PrioridadNotificacion | string;
  leida: boolean;
  fechaEnvio: string;
  usuario?: UsuarioMiniDto | null;
}

export interface UnreadCountResponse {
  usuarioId: number;
  noLeidas: number;
}
