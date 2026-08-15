import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ShieldCheck,
  Lock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Database,
  Users,
  GitBranch,
  Layers,
  Search,
} from "lucide-react";

const TRUST_ITEMS: { key: string; icon: typeof ShieldCheck }[] = [
  { key: "trustSecure", icon: ShieldCheck },
  { key: "trustMultiTenant", icon: Layers },
  { key: "trustPermissionAware", icon: Lock },
  { key: "trustReadOnly", icon: Database },
  { key: "trustAuditable", icon: Search },
  { key: "trustAiPowered", icon: Sparkles },
];

const HOW_STEPS: { titleKey: string; bodyKey: string; icon: typeof Database }[] = [
  { titleKey: "howConnectTitle", bodyKey: "howConnectBody", icon: Database },
  { titleKey: "howUnderstandTitle", bodyKey: "howUnderstandBody", icon: GitBranch },
  { titleKey: "howControlTitle", bodyKey: "howControlBody", icon: Lock },
  { titleKey: "howAskTitle", bodyKey: "howAskBody", icon: Sparkles },
];

export default function Home() {
  const { t } = useTranslation();

  return (
    <div className="flex w-full flex-col items-center">
      {/* Hero */}
      <section className="flex w-full max-w-4xl flex-col items-center gap-6 px-2 pt-16 pb-8 text-center sm:pt-24">
        <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-gray-900 dark:text-gray-100 sm:text-5xl">
          {t("home.heroHeadline")}
        </h1>
        <p className="max-w-2xl text-base text-gray-500 dark:text-gray-400 sm:text-lg">{t("home.heroSubtitle")}</p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/register"
            className="flex items-center gap-1.5 rounded-md bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
          >
            {t("home.heroCtaPrimary")}
            <ArrowRight size={16} />
          </Link>
          <a
            href="#how-it-works"
            className="rounded-md bg-gray-100 dark:bg-gray-800 px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            {t("home.heroCtaSecondary")}
          </a>
        </div>
      </section>

      {/* Product visualization */}
      <section className="w-full max-w-2xl px-2 pb-16 sm:pb-24">
        <div className="rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-xl shadow-gray-900/10 dark:shadow-none">
          <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-400">
            {t("home.mockupLabel")}
          </p>
          <div className="rounded-lg bg-gray-50 dark:bg-gray-800/60 px-4 py-3 text-sm text-gray-700 dark:text-gray-200">
            {t("home.mockupQuestion")}
          </div>
          <div className="mt-3 grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-brand-50 dark:bg-brand-950/30 p-3 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">{t("home.mockupRevenue")}</p>
              <p className="font-display text-lg font-bold text-brand-700 dark:text-brand-400">€842,390</p>
            </div>
            <div className="rounded-lg bg-brand-50 dark:bg-brand-950/30 p-3 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">{t("home.mockupCustomers")}</p>
              <p className="font-display text-lg font-bold text-brand-700 dark:text-brand-400">12,481</p>
            </div>
            <div className="rounded-lg bg-brand-50 dark:bg-brand-950/30 p-3 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">{t("home.mockupGrowth")}</p>
              <p className="font-display text-lg font-bold text-brand-700 dark:text-brand-400">+18.4%</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section id="security" className="w-full bg-white dark:bg-gray-900 py-14 shadow-[inset_0_1px_0_rgba(0,0,0,0.04)] dark:shadow-none">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-8 px-4">
          <h2 className="max-w-xl text-center text-lg font-semibold text-gray-900 dark:text-gray-100">
            {t("home.trustTitle")}
          </h2>
          <div className="grid grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-3 lg:grid-cols-6">
            {TRUST_ITEMS.map(({ key, icon: ItemIcon }) => (
              <div key={key} className="flex flex-col items-center gap-2 text-center">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400">
                  <ItemIcon size={18} />
                </span>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{t(`home.${key}`)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="w-full max-w-5xl px-4 py-16 sm:py-24">
        <h2 className="mx-auto mb-10 max-w-2xl text-center font-display text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-3xl">
          {t("home.problemTitle")}
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="rounded-xl bg-white dark:bg-gray-900 p-6 shadow-sm shadow-gray-900/5 dark:shadow-none">
            <p className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">{t("home.problemHaveTitle")}</p>
            <ul className="flex flex-col gap-2 text-sm text-gray-600 dark:text-gray-300">
              {[1, 2, 3, 4].map((n) => (
                <li key={n} className="flex items-center gap-2">
                  <Users size={14} className="text-gray-400" />
                  {t(`home.problemHave${n}`)}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl bg-white dark:bg-gray-900 p-6 shadow-sm shadow-gray-900/5 dark:shadow-none">
            <p className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">{t("home.problemRequireTitle")}</p>
            <ul className="flex flex-col gap-2 text-sm text-gray-600 dark:text-gray-300">
              {[1, 2, 3, 4].map((n) => (
                <li key={n} className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-gray-400" />
                  {t(`home.problemRequire${n}`)}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-gray-500 dark:text-gray-400">
          {t("home.problemBody")}
        </p>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="w-full bg-white dark:bg-gray-900 px-4 py-16 shadow-[inset_0_1px_0_rgba(0,0,0,0.04)] dark:shadow-none sm:py-24">
        <div className="mx-auto w-full max-w-5xl">
          <h2 className="mb-10 text-center font-display text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-3xl">
            {t("home.howTitle")}
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_STEPS.map(({ titleKey, bodyKey, icon: StepIcon }, i) => (
              <div key={titleKey} className="flex flex-col gap-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 p-5">
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
                    <StepIcon size={16} />
                  </span>
                  <span className="text-xs font-semibold text-gray-400">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <p className="font-display text-sm font-bold text-gray-900 dark:text-gray-100">{t(`home.${titleKey}`)}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t(`home.${bodyKey}`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="flex w-full max-w-2xl flex-col items-center gap-4 px-4 py-16 text-center sm:py-24">
        <Link
          to="/register"
          className="flex items-center gap-1.5 rounded-md bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
        >
          {t("home.heroCtaPrimary")}
          <ArrowRight size={16} />
        </Link>
      </section>
    </div>
  );
}
