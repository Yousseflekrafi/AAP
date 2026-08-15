import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import { AuthCard } from "./AuthCard";
import { useAuth } from "../../hooks/useAuth";
import { Loader } from "../../reusedComponents/Loader";
import { postLoginPath } from "../../utils/roles";

export default function Login() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const loggedInUser = await login({ email, password });
      navigate(postLoginPath(loggedInUser));
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 403) {
        navigate("/verify-email", { state: { email } });
        return;
      }
      setError(t("auth.invalidCredentials"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthCard title={t("auth.login")}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          required
          placeholder={t("common.email")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-md bg-gray-100 dark:bg-gray-800 border border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/30 px-3 py-2 text-sm"
        />
        <input
          type="password"
          required
          placeholder={t("common.password")}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-md bg-gray-100 dark:bg-gray-800 border border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/30 px-3 py-2 text-sm"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="flex items-center justify-center gap-2 rounded-md bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {submitting && <Loader size="sm" className="text-white" />}
          {t("auth.login")}
        </button>
      </form>
      <div className="mt-4 flex justify-between text-sm">
        <Link to="/forgot-password" className="text-brand-600 hover:underline">
          {t("auth.forgotPassword")}
        </Link>
        <Link to="/register" className="text-brand-600 hover:underline">
          {t("auth.noAccount")}
        </Link>
      </div>
    </AuthCard>
  );
}
