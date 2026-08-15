import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import { AuthCard } from "./AuthCard";
import * as authService from "../../services/authService";
import { Loader } from "../../reusedComponents/Loader";
import type { AccountType } from "../../types/auth";

export default function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accountType, setAccountType] = useState<AccountType>("personal");
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
        account_type: accountType,
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
            className="w-1/2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          />
          <input
            type="text"
            placeholder={t("auth.lastName")}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-1/2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
        <input
          type="email"
          required
          placeholder={t("common.email")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
        />
        <input
          type="password"
          required
          minLength={10}
          placeholder={t("common.password")}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
        />
        <div>
          <p className="mb-2 text-sm text-gray-600 dark:text-gray-300">{t("auth.accountType")}</p>
          <div className="flex gap-3">
            {(["personal", "company"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setAccountType(type)}
                className={`flex-1 rounded-md px-3 py-2 text-sm font-medium ring-2 ring-inset ${
                  accountType === type
                    ? "ring-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300"
                    : "ring-transparent bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                }`}
              >
                {t(`auth.${type}`)}
              </button>
            ))}
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="flex items-center justify-center gap-2 rounded-md bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {submitting && <Loader size="sm" className="text-white" />}
          {t("auth.register")}
        </button>
      </form>
      <div className="mt-4 text-center text-sm">
        <Link to="/login" className="text-brand-600 hover:underline">
          {t("auth.haveAccount")}
        </Link>
      </div>
    </AuthCard>
  );
}
