import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { NotificacionDto } from "@/types/notifications";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markManyAsRead,
} from "@/services/notifications";

type Options = {
  pollIntervalMs?: number;
  onlyUnread?: boolean;
  limit?: number; // front-side limit to display dropdown
};

export function useNotifications(userId?: number | null, opts: Options = {}) {
  const { pollIntervalMs = 30000, onlyUnread = true, limit = 20 } = opts;
  const [notifications, setNotifications] = useState<NotificacionDto[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);

  const effectiveUserId = useMemo(() => (userId && userId > 0 ? userId : undefined), [userId]);

  const refresh = useCallback(async () => {
    if (!effectiveUserId) return;
    setLoading(true);
    setError(null);
    try {
      const [list, count] = await Promise.all([
        getNotifications({ usuarioId: effectiveUserId, soloNoLeidas: onlyUnread }),
        getUnreadCount(effectiveUserId),
      ]);
      setUnreadCount(count);
      // sort by fechaEnvio desc and limit
      const sorted = [...list].sort((a, b) => new Date(b.fechaEnvio).getTime() - new Date(a.fechaEnvio).getTime());
      setNotifications(sorted.slice(0, limit));
    } catch (e) {
      setError((e as Error).message ?? "Error al cargar notificaciones");
    } finally {
      setLoading(false);
    }
  }, [effectiveUserId, onlyUnread, limit]);

  const startPolling = useCallback(() => {
    if (!effectiveUserId) return;
    // clear existing
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      refresh();
    }, pollIntervalMs);
  }, [effectiveUserId, pollIntervalMs, refresh]);

  const stopPolling = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const markOneRead = useCallback(async (id: number) => {
    await markAsRead(id);
    await refresh();
  }, [refresh]);

  const markAllVisibleRead = useCallback(async () => {
    const ids = notifications.filter(n => !n.leida).map(n => n.idNotificacion);
    if (ids.length === 0) return 0;
    const count = await markManyAsRead(ids);
    await refresh();
    return count;
  }, [notifications, refresh]);

  useEffect(() => {
    refresh();
    startPolling();
    return () => stopPolling();
  }, [refresh, startPolling, stopPolling]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    refresh,
    markOneRead,
    markAllVisibleRead,
  };
}

export default useNotifications;
