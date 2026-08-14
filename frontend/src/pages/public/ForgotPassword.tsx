import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AuthCard } from "./AuthCard";
import * as authService from "../../services/authService";
import { Loader } from "../../reusedComponents/Loader";

export default function ForgotPassword() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { detail } = await authService.forgotPassword(email);
      setInfo(detail);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthCard title={t("auth.forgotPassword")}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          required
          placeholder={t("common.email")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
        />
        {info && <p className="text-sm text-green-600">{info}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="flex items-center justify-center gap-2 rounded-md bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {submitting && <Loader size="sm" className="text-white" />}
          {t("common.submit")}
        </button>
      </form>
    </AuthCard>
  );
}
