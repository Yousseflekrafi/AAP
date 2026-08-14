import { useState } from "react";
import { useTranslation } from "react-i18next";
import * as authService from "../../services/authService";
import { Loader } from "../../reusedComponents/Loader";

export default function Settings() {
  const { t } = useTranslation();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      const { detail } = await authService.changePassword(currentPassword, newPassword);
      setMessage(detail);
      setCurrentPassword("");
      setNewPassword("");
    } catch {
      setMessage(t("common.somethingWentWrong"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{t("nav.settings")}</h1>
      <form onSubmit={handleSubmit} className="flex max-w-sm flex-col gap-4">
        <input
          type="password"
          required
          placeholder="Current password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
        />
        <input
          type="password"
          required
          minLength={10}
          placeholder={t("auth.newPassword")}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
        />
        {message && <p className="text-sm text-gray-600 dark:text-gray-300">{message}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="flex items-center justify-center gap-2 rounded-md bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {submitting && <Loader size="sm" className="text-white" />}
          {t("common.save")}
        </button>
      </form>
    </div>
  );
}
