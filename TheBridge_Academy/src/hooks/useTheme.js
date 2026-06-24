import { useEffect, useState } from 'react';

const STORAGE_KEY = 'aprentic-theme';
const DARK_THEME = 'dark';
const LIGHT_THEME = 'light';

const getInitialTheme = () => {
  const savedTheme = window.localStorage.getItem(STORAGE_KEY);

  if ([DARK_THEME, LIGHT_THEME].includes(savedTheme)) {
    return savedTheme;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? DARK_THEME
    : LIGHT_THEME;
};

export default function useTheme() {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((currentTheme) => (
      currentTheme === DARK_THEME ? LIGHT_THEME : DARK_THEME
    ));
  };

  return {
    isDarkMode: theme === DARK_THEME,
    theme,
    toggleTheme,
  };
}
