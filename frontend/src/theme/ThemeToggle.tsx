import { useTheme } from './ThemeContext';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label="Changer de thème clair/sombre"
    >
      <span className={`theme-toggle-knob ${theme}`} aria-hidden="true" />
      {theme === 'dark' ? 'Sombre' : 'Clair'}
    </button>
  );
}
