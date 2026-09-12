import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, Check, Minus } from "lucide-react";

type BillingCycle = "monthly" | "annual";

const PLAN_KEYS = ["starter", "team", "enterprise"] as const;
type PlanKey = (typeof PLAN_KEYS)[number];

const PLAN_PRICE: Record<PlanKey, { monthly: number | null; annual: number | null }> = {
  starter: { monthly: 0, annual: 0 },
  team: { monthly: 49, annual: 39 },
  enterprise: { monthly: null, annual: null },
};

const PLAN_FEATURE_COUNT: Record<PlanKey, number> = {
  starter: 5,
  team: 7,
  enterprise: 8,
};

const COMPARISON_ROWS = [
  "compareProjects",
  "compareConnections",
  "compareMembers",
  "compareDataAccess",
  "compareAdminBuilder",
  "compareAi",
  "compareAudit",
  "compareSso",
  "compareSupport",
] as const;

const COMPARISON_VALUES: Record<(typeof COMPARISON_ROWS)[number], [string, string, string]> = {
  compareProjects: ["1", "Unlimited", "Unlimited"],
  compareConnections: ["1", "Unlimited", "Unlimited"],
  compareMembers: ["3", "20", "Unlimited"],
  compareDataAccess: ["check", "check", "check"],
  compareAdminBuilder: ["check", "check", "check"],
  compareAi: ["dash", "check", "check"],
  compareAudit: ["dash", "check", "check"],
  compareSso: ["dash", "dash", "check"],
  compareSupport: ["community", "priority", "dedicated"],
};

const FAQ_KEYS = ["faq1", "faq2", "faq3", "faq4", "faq5"] as const;

export default function Pricing() {
  const { t } = useTranslation();
  const [cycle, setCycle] = useState<BillingCycle>("monthly");

  return (
    <div className="flex w-full flex-col items-center">
      {/* Hero */}
      <section className="flex w-full max-w-3xl flex-col items-center gap-4 px-2 pt-16 pb-8 text-center sm:pt-24">
        <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-gray-900 dark:text-gray-100 sm:text-5xl">
          {t("pricing.heroHeadline")}
        </h1>
        <p className="max-w-xl text-base text-gray-500 dark:text-gray-400 sm:text-lg">{t("pricing.heroSubtitle")}</p>

        <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-gray-100 p-1 dark:bg-gray-800">
          <button
            type="button"
            onClick={() => setCycle("monthly")}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-150 ${
              cycle === "monthly" ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-gray-100" : "text-gray-500 dark:text-gray-400"
            }`}
          >
            {t("pricing.billingMonthly")}
          </button>
          <button
            type="button"
            onClick={() => setCycle("annual")}
            className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-150 ${
              cycle === "annual" ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-gray-100" : "text-gray-500 dark:text-gray-400"
            }`}
          >
            {t("pricing.billingAnnual")}
            <span className="rounded-full bg-green-50 px-1.5 py-0.5 text-[10px] font-semibold text-green-700 dark:bg-green-950/40 dark:text-green-400">
              {t("pricing.billingAnnualSaving")}
            </span>
          </button>
        </div>
      </section>

      {/* Plan cards */}
      <section className="w-full max-w-5xl px-4 pb-16 sm:pb-24">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {PLAN_KEYS.map((plan) => {
            const price = PLAN_PRICE[plan][cycle];
            const featured = plan === "team";
            return (
              <div
                key={plan}
                className={`relative flex flex-col gap-6 rounded-xl border bg-white p-6 dark:bg-gray-900 ${
                  featured
                    ? "border-brand-600 shadow-md shadow-brand-900/10 dark:border-brand-500"
                    : "border-gray-200 shadow-sm dark:border-gray-800"
                }`}
              >
                {featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white">
                    {t("pricing.mostPopular")}
                  </span>
                )}

                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">{t(`pricing.${plan}Name`)}</h2>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t(`pricing.${plan}Description`)}</p>
                </div>

                <div className="flex items-baseline gap-1">
                  {price === null ? (
                    <span className="font-display text-3xl font-bold text-gray-900 dark:text-gray-100">{t("pricing.customPricing")}</span>
                  ) : price === 0 ? (
                    <span className="font-display text-3xl font-bold text-gray-900 dark:text-gray-100">{t("pricing.free")}</span>
                  ) : (
                    <>
                      <span className="font-display text-3xl font-bold text-gray-900 dark:text-gray-100">${price}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">/{t("pricing.perMonth")}</span>
                    </>
                  )}
                </div>

                <Link
                  to={plan === "enterprise" ? "/register" : "/register"}
                  className={`flex items-center justify-center gap-1.5 rounded-md px-4 py-2.5 text-sm font-medium transition-colors duration-150 ${
                    featured
                      ? "bg-brand-600 text-white hover:bg-brand-700"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  {plan === "enterprise" ? t("pricing.contactSales") : t("pricing.startFree")}
                  <ArrowRight size={16} />
                </Link>

                <ul className="flex flex-col gap-2.5 text-sm text-gray-600 dark:text-gray-300">
                  {Array.from({ length: PLAN_FEATURE_COUNT[plan] }, (_, i) => i + 1).map((n) => (
                    <li key={n} className="flex items-start gap-2">
                      <Check size={16} className="mt-0.5 shrink-0 text-brand-600 dark:text-brand-400" />
                      {t(`pricing.${plan}Feature${n}`)}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* Comparison table */}
      <section className="w-full bg-white px-4 py-16 shadow-[inset_0_1px_0_rgba(0,0,0,0.04)] dark:bg-gray-900 dark:shadow-none sm:py-24">
        <div className="mx-auto w-full max-w-5xl">
          <h2 className="mb-10 text-center font-display text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-3xl">
            {t("pricing.compareTitle")}
          </h2>
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">{t("pricing.compareFeature")}</th>
                  {PLAN_KEYS.map((plan) => (
                    <th key={plan} className="px-4 py-3 text-center font-semibold text-gray-900 dark:text-gray-100">
                      {t(`pricing.${plan}Name`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row, idx) => (
                  <tr key={row} className={idx % 2 === 1 ? "bg-gray-50 dark:bg-gray-800/40" : ""}>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{t(`pricing.${row}`)}</td>
                    {COMPARISON_VALUES[row].map((value, i) => (
                      <td key={i} className="px-4 py-3 text-center">
                        {value === "check" ? (
                          <Check size={16} className="mx-auto text-brand-600 dark:text-brand-400" />
                        ) : value === "dash" ? (
                          <Minus size={16} className="mx-auto text-gray-300 dark:text-gray-600" />
                        ) : (
                          <span className="text-gray-700 dark:text-gray-300">
                            {["community", "priority", "dedicated"].includes(value) ? t(`pricing.support_${value}`) : value}
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="w-full max-w-3xl px-4 py-16 sm:py-24">
        <h2 className="mb-10 text-center font-display text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-3xl">
          {t("pricing.faqTitle")}
        </h2>
        <div className="flex flex-col divide-y divide-gray-200 dark:divide-gray-800">
          {FAQ_KEYS.map((key) => (
            <details key={key} className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                {t(`pricing.${key}Q`)}
                <span className="shrink-0 text-gray-400 transition-transform duration-150 group-open:rotate-45">+</span>
              </summary>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{t(`pricing.${key}A`)}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="flex w-full max-w-2xl flex-col items-center gap-4 px-4 py-16 text-center sm:py-24">
        <h2 className="font-display text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-3xl">
          {t("pricing.ctaTitle")}
        </h2>
        <Link
          to="/register"
          className="flex items-center gap-1.5 rounded-md bg-brand-600 px-5 py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-brand-700"
        >
          {t("home.heroCtaPrimary")}
          <ArrowRight size={16} />
        </Link>
      </section>
    </div>
  );
}
