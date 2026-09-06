import type { FC } from "react";
import type { UiLocale } from "../../onboarding/repositories";
import {
  DEFAULT_THEME,
  DEFAULT_TYPOGRAPHY,
  THEMES,
  TYPOGRAPHIES,
  applyTheme,
  type ThemeId,
  type TypographyId,
} from "../../styles/theme";
import { getTranslation } from "../i18n";

export interface ThemeSelectorProps {
  readonly activeTheme?: ThemeId;
  readonly activeTypography?: TypographyId;
  readonly locale?: UiLocale;
  readonly onThemeChange?: (theme: ThemeId) => void;
  readonly onTypographyChange?: (typography: TypographyId) => void;
}

export const ThemeSelector: FC<ThemeSelectorProps> = ({
  activeTheme = DEFAULT_THEME,
  activeTypography = DEFAULT_TYPOGRAPHY,
  locale = "en",
  onThemeChange,
  onTypographyChange,
}) => {
  const t = getTranslation(locale);

  const handleThemeSelect = (theme: ThemeId) => {
    applyTheme(theme, activeTypography);
    onThemeChange?.(theme);
  };

  const handleTypographySelect = (typography: TypographyId) => {
    applyTheme(activeTheme, typography);
    onTypographyChange?.(typography);
  };

  return (
    <div className="flex flex-col gap-4 text-xs font-medium">
      {/* Theme Selection */}
      <div className="flex flex-col gap-1.5">
        <span className="text-muted uppercase tracking-wider text-[10px] font-semibold">
          {t.theme.title}
        </span>
        <div
          role="radiogroup"
          aria-label={t.theme.title}
          className="flex flex-wrap gap-1.5 p-1 bg-paper/60 border border-line rounded-lg"
        >
          {THEMES.map((themeId) => {
            const isSelected = activeTheme === themeId;
            return (
              <button
                key={themeId}
                type="button"
                role="radio"
                aria-checked={isSelected}
                aria-pressed={isSelected}
                onClick={() => handleThemeSelect(themeId)}
                className={`px-3 py-1.5 rounded-md transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? "bg-accent text-white font-semibold shadow-xs"
                    : "text-muted hover:text-ink hover:bg-panel"
                }`}
              >
                {t.theme.themes[themeId]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Typography Selection */}
      <div className="flex flex-col gap-1.5">
        <span className="text-muted uppercase tracking-wider text-[10px] font-semibold">
          {t.theme.typographyTitle}
        </span>
        <div
          role="radiogroup"
          aria-label={t.theme.typographyTitle}
          className="flex flex-wrap gap-1.5 p-1 bg-paper/60 border border-line rounded-lg"
        >
          {TYPOGRAPHIES.map((typoId) => {
            const isSelected = activeTypography === typoId;
            return (
              <button
                key={typoId}
                type="button"
                role="radio"
                aria-checked={isSelected}
                aria-pressed={isSelected}
                onClick={() => handleTypographySelect(typoId)}
                className={`px-3 py-1.5 rounded-md transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? "bg-accent text-white font-semibold shadow-xs"
                    : "text-muted hover:text-ink hover:bg-panel"
                }`}
              >
                {t.theme.typographies[typoId]}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
