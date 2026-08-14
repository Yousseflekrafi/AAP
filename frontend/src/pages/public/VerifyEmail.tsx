import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthCard } from "./AuthCard";
import * as authService from "../../services/authService";
import { useAppDispatch } from "../../store";
import { setUser } from "../../store/slices/authSlice";
import { Loader } from "../../reusedComponents/Loader";
import { postLoginPath } from "../../utils/roles";

export default function VerifyEmail() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const location = useLocation() as { state?: { email?: string } };

  const [email, setEmail] = useState(location.state?.email ?? "");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { user } = await authService.verifyEmail(email, code);
      dispatch(setUser(user));
      navigate(postLoginPath(user));
    } catch {
      setError(t("common.somethingWentWrong"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    setError(null);
    setInfo(null);
    const { detail } = await authService.resendVerification(email);
    setInfo(detail);
  };

  return (
    <AuthCard title={t("auth.verifyEmailTitle")}>
      <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">{t("auth.verifyEmailBody")}</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          required
          placeholder={t("common.email")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
        />
        <input
          type="text"
          required
          maxLength={6}
          minLength={6}
          placeholder="000000"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-center text-lg tracking-widest"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
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
      <button
        type="button"
        onClick={() => void handleResend()}
        className="mt-4 w-full text-center text-sm text-brand-600 hover:underline"
      >
        {t("auth.resendCode")}
      </button>
    </AuthCard>
  );
}
