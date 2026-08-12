import { useAppDispatch, useAppSelector } from "../../store";
import { selectTheme, toggleTheme } from "../../store/slices/themeSlice";
import { Icon } from "../Icon";

export function ThemeSwitcher() {
  const theme = useAppSelector(selectTheme);
  const dispatch = useAppDispatch();

  return (
    <button
      type="button"
      onClick={() => dispatch(toggleTheme())}
      aria-label="Toggle theme"
      className="flex h-9 w-9 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
    >
      <Icon name={theme === "dark" ? "sun" : "moon"} size={18} />
    </button>
  );
}
