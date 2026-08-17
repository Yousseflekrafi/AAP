import { useState } from "react";
import { useTranslation } from "react-i18next";
import * as authService from "../../services/authService";
import { Loader } from "../../reusedComponents/Loader";
import { Card } from "../../reusedComponents/Card";
import { ConfirmDialog } from "../../reusedComponents/Modal";
import { useAppDispatch, useAppSelector } from "../../store";
import { selectTheme, setTheme, type Theme } from "../../store/slices/themeSlice";
import { selectLanguage, setLanguage, type Language } from "../../store/slices/languageSlice";

const inputClass =
  "rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20";

const selectClass =
  "rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20";

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-150 ${
        checked ? "bg-brand-600" : "bg-gray-200 dark:bg-gray-700"
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-150 ${
          checked ? "translate-x-[22px]" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

function SecurityCard() {
  const { t } = useTranslation();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    if (newPassword !== confirmPassword) {
      setError(t("settings.passwordsDontMatch"));
      return;
    }
    setSubmitting(true);
    try {
      await authService.changePassword(currentPassword, newPassword);
      setMessage(t("settings.passwordUpdated"));
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setError(t("common.somethingWentWrong"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card icon="shield" title={t("settings.security")} description={t("settings.securitySubtitle")}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="currentPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t("auth.currentPassword")}
          </label>
          <input
            id="currentPassword"
            type="password"
            required
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="newPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t("auth.newPassword")}
          </label>
          <input
            id="newPassword"
            type="password"
            required
            minLength={10}
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t("auth.confirmNewPassword")}
          </label>
          <input
            id="confirmPassword"
            type="password"
            required
            minLength={10}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={inputClass}
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {message && <p className="text-sm text-green-600">{message}</p>}
        <div className="mt-1 flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center justify-center gap-2 rounded-md bg-brand-600 px-5 py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-brand-700 disabled:opacity-60"
          >
            {submitting && <Loader size="sm" className="text-white" />}
            {t("common.save")}
          </button>
        </div>
      </form>
    </Card>
  );
}

function PreferencesCard() {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const theme = useAppSelector(selectTheme);
  const language = useAppSelector(selectLanguage);
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <Card icon="settings" title={t("settings.preferences")} description={t("settings.preferencesSubtitle")}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("settings.language")}</label>
          <select
            value={language}
            onChange={(e) => {
              const next = e.target.value as Language;
              dispatch(setLanguage(next));
              void i18n.changeLanguage(next);
            }}
            className={selectClass}
          >
            <option value="en">English</option>
            <option value="fr">Français</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("settings.theme")}</label>
          <select
            value={theme}
            onChange={(e) => dispatch(setTheme(e.target.value as Theme))}
            className={selectClass}
          >
            <option value="light">{t("settings.themeLight")}</option>
            <option value="dark">{t("settings.themeDark")}</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("settings.timezone")}</label>
          <input value={timezone} disabled className={`${inputClass} disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 dark:disabled:bg-gray-800/60`} />
          <p className="text-xs text-gray-400">{t("settings.timezoneHelp")}</p>
        </div>
      </div>
    </Card>
  );
}

function NotificationsCard() {
  const { t } = useTranslation();
  const [emailNotifs, setEmailNotifs] = useState(() => localStorage.getItem("aap-notif-email") !== "off");
  const [inAppNotifs, setInAppNotifs] = useState(() => localStorage.getItem("aap-notif-inapp") !== "off");

  return (
    <Card icon="bell" title={t("settings.notifications")} description={t("settings.notificationsSubtitle")}>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{t("settings.emailNotifications")}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t("settings.emailNotificationsHelp")}</p>
          </div>
          <Toggle
            checked={emailNotifs}
            onChange={(v) => {
              setEmailNotifs(v);
              localStorage.setItem("aap-notif-email", v ? "on" : "off");
            }}
          />
        </div>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{t("settings.inAppNotifications")}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t("settings.inAppNotificationsHelp")}</p>
          </div>
          <Toggle
            checked={inAppNotifs}
            onChange={(v) => {
              setInAppNotifs(v);
              localStorage.setItem("aap-notif-inapp", v ? "on" : "off");
            }}
          />
        </div>
      </div>
    </Card>
  );
}

function DangerZoneCard() {
  const { t } = useTranslation();
  const [confirmAction, setConfirmAction] = useState<"deactivate" | "delete" | null>(null);
  const [showContactAdmin, setShowContactAdmin] = useState(false);

  return (
    <Card icon="power" title={t("settings.dangerZone")} description={t("settings.dangerZoneSubtitle")} danger>
      <div className="flex flex-col divide-y divide-red-100 dark:divide-red-900/30">
        <div className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{t("settings.deactivateAccount")}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t("settings.deactivateAccountHelp")}</p>
          </div>
          <button
            type="button"
            onClick={() => setConfirmAction("deactivate")}
            className="shrink-0 rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 transition-colors duration-150 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-950/30"
          >
            {t("settings.deactivateAccount")}
          </button>
        </div>
        <div className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{t("settings.deleteAccount")}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t("settings.deleteAccountHelp")}</p>
          </div>
          <button
            type="button"
            onClick={() => setConfirmAction("delete")}
            className="shrink-0 rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-red-700"
          >
            {t("settings.deleteAccount")}
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmAction !== null}
        title={confirmAction === "delete" ? t("settings.deleteAccount") : t("settings.deactivateAccount")}
        message={confirmAction === "delete" ? t("settings.deleteAccountHelp") : t("settings.deactivateAccountHelp")}
        onCancel={() => setConfirmAction(null)}
        onConfirm={() => {
          setConfirmAction(null);
          setShowContactAdmin(true);
        }}
      />
      <ConfirmDialog
        open={showContactAdmin}
        title={t("settings.contactAdminTitle")}
        message={t("settings.contactAdminBody")}
        confirmLabel={t("common.confirm")}
        danger={false}
        onCancel={() => setShowContactAdmin(false)}
        onConfirm={() => setShowContactAdmin(false)}
      />
    </Card>
  );
}

export default function Settings() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{t("nav.settings")}</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SecurityCard />
        <PreferencesCard />
        <NotificationsCard />
        <DangerZoneCard />
      </div>
    </div>
  );
}
