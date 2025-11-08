import api from "./api";
import type { NotificacionDto, UnreadCountResponse } from "@/types/notifications";

export type GetNotificationsParams = {
  usuarioId?: number;
  soloNoLeidas?: boolean;
};

export const getNotifications = async (
  params: GetNotificationsParams = {}
): Promise<NotificacionDto[]> => {
  const res = await api.get("/api/Notificaciones", { params });
  return res.data as NotificacionDto[];
};

export const getUnreadCount = async (
  usuarioId: number
): Promise<number> => {
  const res = await api.get(`/api/Notificaciones/usuario/${usuarioId}/no-leidas-count`);
  const data: unknown = res.data;
  // Some backends return the count wrapped; fallback to direct numeric if needed
  if (typeof data === "number") return data;
  const obj = data as Partial<UnreadCountResponse & { noLeidas: number }>;
  return obj.noLeidas ?? 0;
};

export const markAsRead = async (notificacionId: number): Promise<void> => {
  await api.post(`/api/Notificaciones/${notificacionId}/leer`);
};

export const markManyAsRead = async (ids: number[]): Promise<number> => {
  const res = await api.post(`/api/Notificaciones/leer-multiples`, ids);
  return (res.data?.marcadas as number) ?? 0;
};

export const deleteNotification = async (notificacionId: number): Promise<void> => {
  await api.delete(`/api/Notificaciones/${notificacionId}`);
};
