import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Icon } from "../Icon";
import { useAuth } from "../../hooks/useAuth";
import { fetchUnreadCount } from "../../services/notificationsService";

export function UserMenu({ dark = false }: { dark?: boolean }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["notifications-unread-count"],
    queryFn: fetchUnreadCount,
    refetchInterval: 30_000,
    enabled: !!user,
  });

  if (!user) return null;

  const go = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  const itemClass = dark
    ? "flex w-full items-center gap-2.5 px-3 py-2 text-sm text-slate-200 transition-colors duration-150 hover:bg-white/5"
    : "flex w-full items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 transition-colors duration-150 hover:bg-gray-50 dark:hover:bg-gray-800";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="User menu"
        aria-expanded={open}
        className={`flex items-center gap-2 rounded-md px-1.5 py-1.5 transition-colors duration-150 sm:px-2 ${
          dark ? "hover:bg-white/5" : "hover:bg-gray-100 dark:hover:bg-gray-800"
        }`}
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-700 dark:bg-brand-950/40 dark:text-brand-300">
          {user.full_name?.[0]?.toUpperCase() ?? user.email[0]?.toUpperCase()}
        </span>
        <span className={`hidden text-sm font-medium sm:inline ${dark ? "text-slate-100" : "text-gray-700 dark:text-gray-200"}`}>
          {user.full_name}
        </span>
        <Icon
          name="chevronDown"
          size={16}
          className={`hidden transition-transform duration-150 sm:block ${open ? "rotate-180" : ""} ${
            dark ? "text-slate-400" : "text-gray-400"
          }`}
        />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className={`absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-xl shadow-md shadow-gray-900/10 ${
              dark ? "bg-admin-surface border border-admin-border" : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
            }`}
          >
            <div className={`px-3 py-3 ${dark ? "border-b border-admin-border" : "border-b border-gray-100 dark:border-gray-800"}`}>
              <p className={`truncate text-sm font-medium ${dark ? "text-slate-100" : "text-gray-900 dark:text-gray-100"}`}>
                {user.full_name}
              </p>
              <p className={`truncate text-xs ${dark ? "text-slate-400" : "text-gray-500 dark:text-gray-400"}`}>{user.email}</p>
            </div>
            <div className="py-1">
              <button type="button" onClick={() => go("/profile")} className={itemClass}>
                <Icon name="user" size={16} />
                {t("nav.profile")}
              </button>
              <button type="button" onClick={() => go("/messages")} className={itemClass}>
                <Icon name="chat" size={16} />
                <span className="flex-1 text-left">{t("nav.messages")}</span>
                {unreadCount > 0 && <span className="h-2 w-2 shrink-0 rounded-full bg-red-500" />}
              </button>
              <button type="button" onClick={() => go("/settings")} className={itemClass}>
                <Icon name="settings" size={16} />
                {t("nav.settings")}
              </button>
            </div>
            <div className={dark ? "border-t border-admin-border py-1" : "border-t border-gray-100 dark:border-gray-800 py-1"}>
              <button
                type="button"
                onClick={() => void logout()}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-red-600 transition-colors duration-150 hover:bg-red-50 dark:hover:bg-red-950/30"
              >
                <Icon name="logout" size={16} />
                {t("common.logout")}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
