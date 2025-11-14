import { useMemo } from "react";
import { Bell } from "lucide-react";
import useNotifications from "@/hooks/notifications/useNotifications";
import { cn } from "@/utils/utils";
import { useNotificationsPanel } from "@/context/NotificationsPanelContext";

type Props = {
  userId?: number | null;
  compact?: boolean; // for collapsed sidebar
};

export default function NotificationBell({ userId, compact = false }: Props) {
  const { unreadCount } = useNotifications(userId, {
    pollIntervalMs: 30000,
    onlyUnread: true,
    limit: 20,
  });
  const { togglePanel } = useNotificationsPanel();

  const badge = useMemo(() => {
    if (!unreadCount) return null;
    const display = unreadCount > 99 ? "99+" : String(unreadCount);
    return (
      <span className="absolute -top-1 -right-1 bg-error text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow">
        {display}
      </span>
    );
  }, [unreadCount]);

  return (
    <div className={cn("relative", compact ? "" : "ml-auto")}
    >
      <button
        className={cn(
          "relative flex items-center justify-center rounded-md transition-colors",
          compact ? "h-8 w-8 hover:bg-white/10" : "h-9 w-9 hover:bg-muted"
        )}
        aria-label="Notificaciones"
        title="Notificaciones"
        onClick={togglePanel}
      >
        <Bell className={cn("", compact ? "h-4 w-4 text-white" : "h-5 w-5 text-foreground")} />
        {badge}
      </button>
    </div>
  );
}
