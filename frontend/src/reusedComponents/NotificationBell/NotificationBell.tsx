import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Icon } from "../Icon";
import {
  fetchNotifications,
  fetchUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
} from "../../services/notificationsService";
import type { AppNotification } from "../../types/notifications";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["notifications-unread-count"],
    queryFn: fetchUnreadCount,
    refetchInterval: 30_000,
  });

  const { data } = useQuery({
    queryKey: ["notifications-recent"],
    queryFn: () => fetchNotifications(1),
    enabled: open,
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["notifications-unread-count"] });
    void queryClient.invalidateQueries({ queryKey: ["notifications-recent"] });
  };

  const handleClickNotification = async (notification: AppNotification) => {
    if (!notification.is_read) {
      await markNotificationRead(notification.id);
      invalidate();
    }
    setOpen(false);
    if (notification.action_url) navigate(notification.action_url);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        className="relative flex h-9 w-9 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
      >
        <Icon name="bell" size={18} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-medium text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-80 rounded-xl bg-white dark:bg-gray-900 shadow-xl shadow-gray-900/10">
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Notifications</span>
              <button
                type="button"
                onClick={async () => {
                  await markAllNotificationsRead();
                  invalidate();
                }}
                className="text-xs text-brand-600 hover:underline"
              >
                Mark all read
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {(data?.results.length ?? 0) === 0 && (
                <p className="px-3 py-4 text-center text-sm text-gray-400">No notifications</p>
              )}
              {data?.results.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => void handleClickNotification(n)}
                  className={`block w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800 ${
                    n.is_read ? "text-gray-500 dark:text-gray-400" : "text-gray-900 dark:text-gray-100"
                  }`}
                >
                  <span className="block font-medium">{n.title}</span>
                  {n.body && <span className="block text-xs text-gray-400">{n.body}</span>}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
