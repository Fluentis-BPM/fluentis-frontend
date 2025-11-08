import { useEffect, useState } from "react";
import { X, Check, Loader2 } from "lucide-react";
import { cn } from "@/utils/utils";
import { useSelector } from "react-redux";
import { selectUser } from "@/store";
import useNotifications from "@/hooks/notifications/useNotifications";
import { formatDistance } from "date-fns";
import { es } from "date-fns/locale";
import { useNotificationsPanel } from "@/context/NotificationsPanelContext";

export default function NotificationPanel() {
  const user = useSelector(selectUser);
  const { open, closePanel } = useNotificationsPanel();
  const [onlyUnread, setOnlyUnread] = useState(false);
  const { notifications, unreadCount, loading, error, markOneRead, markAllVisibleRead, refresh } = useNotifications(user?.idUsuario, {
    pollIntervalMs: 30000,
    onlyUnread,
    limit: 100,
  });

  // Trap scroll when open (prevent body scroll)
  useEffect(() => {
    if (open) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = original; };
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" onClick={closePanel} />

      {/* Panel */}
      <div className={cn(
        "absolute right-0 top-0 h-full w-full sm:w-1/2 lg:w-1/3 bg-white border-l border-border shadow-xl flex flex-col",
      )}>
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center gap-2">
          <h2 className="text-base font-semibold">Notificaciones</h2>
          <span className="ml-2 text-xs text-muted-foreground">{unreadCount} no leídas</span>
          <div className="ml-auto flex items-center gap-2">
            <div className="flex items-center gap-1 mr-2">
              <span className="text-xs text-muted-foreground">Solo no leídas</span>
              <button
                className={"text-xs px-2 py-1 rounded border border-border " + (onlyUnread ? "bg-primary/10 text-primary" : "hover:bg-muted")}
                onClick={() => setOnlyUnread(v => !v)}
                aria-pressed={onlyUnread}
              >
                {onlyUnread ? "Sí" : "No"}
              </button>
            </div>
            <button
              className="text-xs px-2 py-1 rounded hover:bg-muted disabled:opacity-50"
              onClick={() => markAllVisibleRead()}
              disabled={!unreadCount}
            >
              <Check className="inline h-3.5 w-3.5 mr-1" /> Marcar todas
            </button>
            <button
              className="text-xs px-2 py-1 rounded hover:bg-muted"
              onClick={() => refresh()}
            >
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Recargar"}
            </button>
            <button
              className="p-1 rounded hover:bg-muted"
              onClick={closePanel}
              aria-label="Cerrar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {error && (
            <div className="p-3 text-xs text-error">{error}</div>
          )}
          {!loading && notifications.length === 0 && (
            <div className="p-6 text-sm text-muted-foreground">No hay notificaciones nuevas</div>
          )}
          <ul className="divide-y divide-border">
            {notifications.map((n) => {
              const p = String(n.prioridad).toLowerCase();
              const color = p.includes("critica")
                ? "bg-red-500"
                : p.includes("alta")
                ? "bg-orange-500"
                : p.includes("media")
                ? "bg-amber-500"
                : "bg-emerald-500";
              return (
                <li key={n.idNotificacion} className="p-4">
                  <div className="flex items-start gap-3">
                    <span className={cn("h-2 w-2 rounded-full mt-1", color)} />
                    <div className="flex-1 min-w-0">
                      <div className={cn("text-sm", n.leida ? "text-muted-foreground" : "text-foreground font-medium")}>{n.mensaje}</div>
                      <div className="text-[10px] text-muted-foreground mt-1">
                        {formatDistance(new Date(n.fechaEnvio), new Date(), { addSuffix: true, locale: es })}
                      </div>
                    </div>
                    {!n.leida && (
                      <button
                        className="ml-2 text-xs px-2 py-1 rounded hover:bg-primary/10 text-primary"
                        onClick={() => markOneRead(n.idNotificacion)}
                      >
                        <Check className="inline h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
