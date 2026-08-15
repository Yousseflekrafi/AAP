import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "../../store";
import { selectLanguage, setLanguage, type Language } from "../../store/slices/languageSlice";

const LANGUAGES: { code: Language; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "fr", label: "FR" },
];

export function LanguageSwitcher() {
  const language = useAppSelector(selectLanguage);
  const dispatch = useAppDispatch();
  const { i18n } = useTranslation();

  const handleChange = (code: Language) => {
    dispatch(setLanguage(code));
    void i18n.changeLanguage(code);
  };

  return (
    <div className="flex items-center gap-1 rounded-md bg-gray-100 dark:bg-gray-800 p-0.5 text-xs font-medium">
      {LANGUAGES.map(({ code, label }) => (
        <button
          key={code}
          type="button"
          onClick={() => handleChange(code)}
          className={`rounded px-2 py-1 ${
            language === code
              ? "bg-brand-600 text-white"
              : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
