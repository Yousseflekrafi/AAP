import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import { AuthCard } from "./AuthCard";
import { useAuth } from "../../hooks/useAuth";
import { Loader } from "../../reusedComponents/Loader";

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
      await login({ email, password });
      navigate("/dashboard");
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
          className="rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
        />
        <input
          type="password"
          required
          placeholder={t("common.password")}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="flex items-center justify-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {submitting && <Loader size="sm" className="text-white" />}
          {t("auth.login")}
        </button>
      </form>
      <div className="mt-4 flex justify-between text-sm">
        <Link to="/forgot-password" className="text-blue-600 hover:underline">
          {t("auth.forgotPassword")}
        </Link>
        <Link to="/register" className="text-blue-600 hover:underline">
          {t("auth.noAccount")}
        </Link>
      </div>
    </AuthCard>
  );
}
