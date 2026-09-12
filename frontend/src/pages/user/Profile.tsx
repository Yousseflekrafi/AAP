import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useAppDispatch } from "../../store";
import { setUser } from "../../store/slices/authSlice";
import * as authService from "../../services/authService";
import { Card } from "../../reusedComponents/Card";
import { Loader } from "../../reusedComponents/Loader";
import { Icon } from "../../reusedComponents/Icon";

const inputClass =
  "rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 dark:disabled:bg-gray-800/60";

export default function Profile() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const dispatch = useAppDispatch();

  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState(user?.first_name ?? "");
  const [lastName, setLastName] = useState(user?.last_name ?? "");

  const saveMutation = useMutation({
    mutationFn: () => authService.updateProfile({ first_name: firstName, last_name: lastName }),
    onSuccess: (updated) => {
      dispatch(setUser(updated));
      setEditing(false);
    },
  });

  if (!user) return null;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{t("nav.profile")}</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card icon="user" title={t("profile.overview")} className="lg:col-span-2">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xl font-semibold text-brand-700 dark:bg-brand-950/40 dark:text-brand-300">
              {user.full_name?.[0]?.toUpperCase() ?? user.email[0]?.toUpperCase()}
            </span>
            <div className="flex flex-col gap-1.5">
              <p className="text-base font-semibold text-gray-900 dark:text-gray-100">{user.full_name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 dark:bg-brand-950/40 dark:text-brand-300">
                  {t(`role.${user.role}`)}
                </span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                    user.is_email_verified
                      ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                      : "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                  }`}
                >
                  {user.is_email_verified ? t("profile.verified") : t("profile.notVerified")}
                </span>
              </div>
            </div>
          </div>
        </Card>

        <Card
          icon="settings"
          title={t("profile.accountDetails")}
          description={t("profile.accountDetailsBody")}
          headerAction={
            !editing && (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors duration-150 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                {t("common.edit")}
              </button>
            )
          }
        >
          {editing ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveMutation.mutate();
              }}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("auth.firstName")}</label>
                <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputClass} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("auth.lastName")}</label>
                <input value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputClass} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("common.email")}</label>
                <input value={user.email} disabled className={inputClass} />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setFirstName(user.first_name);
                    setLastName(user.last_name);
                    setEditing(false);
                  }}
                  className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-colors duration-150 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="flex items-center justify-center gap-2 rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-brand-700 disabled:opacity-60"
                >
                  {saveMutation.isPending && <Loader size="sm" className="text-white" />}
                  {t("common.save")}
                </button>
              </div>
            </form>
          ) : (
            <dl className="grid grid-cols-[120px_1fr] gap-y-3 text-sm">
              <dt className="text-gray-500 dark:text-gray-400">{t("auth.firstName")}</dt>
              <dd className="text-gray-900 dark:text-gray-100">{user.first_name || "—"}</dd>
              <dt className="text-gray-500 dark:text-gray-400">{t("auth.lastName")}</dt>
              <dd className="text-gray-900 dark:text-gray-100">{user.last_name || "—"}</dd>
              <dt className="text-gray-500 dark:text-gray-400">{t("common.email")}</dt>
              <dd className="text-gray-900 dark:text-gray-100">{user.email}</dd>
            </dl>
          )}
        </Card>

        <Card icon="dashboard" title={t("profile.activity")} description={t("profile.activityBody")}>
          <dl className="flex flex-col gap-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-gray-500 dark:text-gray-400">{t("organization.presence")}</dt>
              <dd className="flex items-center gap-1.5 font-medium text-gray-900 dark:text-gray-100">
                <span className={`h-2 w-2 rounded-full ${user.is_online ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"}`} />
                {user.is_online ? t("status.online") : t("status.offline")}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-gray-500 dark:text-gray-400">{t("profile.lastActive")}</dt>
              <dd className="font-medium text-gray-900 dark:text-gray-100">
                {user.last_seen_at ? new Date(user.last_seen_at).toLocaleString() : t("profile.never")}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-gray-500 dark:text-gray-400">{t("profile.accountCreated")}</dt>
              <dd className="font-medium text-gray-900 dark:text-gray-100">{new Date(user.created_at).toLocaleDateString()}</dd>
            </div>
          </dl>
        </Card>

        <Card icon="shield" title={t("profile.security")} description={t("profile.securityBody")}>
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 dark:text-gray-400">{t("profile.twoFactor")}</span>
              <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                {t("profile.notEnabled")}
              </span>
            </div>
            <Link
              to="/settings"
              className="flex items-center gap-1.5 self-start text-sm font-medium text-brand-600 transition-colors duration-150 hover:text-brand-700 dark:text-brand-400"
            >
              <Icon name="settings" size={14} />
              {t("profile.goToSecurity")}
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
