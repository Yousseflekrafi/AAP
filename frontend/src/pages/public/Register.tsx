import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import { AuthCard } from "./AuthCard";
import * as authService from "../../services/authService";
import { Loader } from "../../reusedComponents/Loader";

export default function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await authService.register({
        email,
        password,
        first_name: firstName,
        last_name: lastName,
      });
      navigate("/verify-email", { state: { email } });
    } catch (err) {
      if (isAxiosError(err) && err.response?.data?.error?.message) {
        const message = err.response.data.error.message;
        setError(typeof message === "string" ? message : JSON.stringify(message));
      } else {
        setError(t("common.somethingWentWrong"));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthCard title={t("auth.register")}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex gap-3">
          <input
            type="text"
            placeholder={t("auth.firstName")}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-1/2 rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
          />
          <input
            type="text"
            placeholder={t("auth.lastName")}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-1/2 rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
          />
        </div>
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
          minLength={10}
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
          {t("auth.register")}
        </button>
      </form>
      <div className="mt-4 text-center text-sm">
        <Link to="/login" className="text-blue-600 hover:underline">
          {t("auth.haveAccount")}
        </Link>
      </div>
    </AuthCard>
  );
}
