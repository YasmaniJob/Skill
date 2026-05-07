import { createContext, useContext } from 'react';
import { theme as defaultTheme } from './pdfx-theme';

export const PdfxThemeContext = createContext(defaultTheme);

export function PdfxThemeProvider({ theme, children }) {
  const resolvedTheme = theme ?? defaultTheme;
  return <PdfxThemeContext.Provider value={resolvedTheme}>{children}</PdfxThemeContext.Provider>;
}

export function usePdfxTheme() {
  try {
    return useContext(PdfxThemeContext);
  } catch (error) {
    if (
      error instanceof Error &&
      /invalid hook call|useContext|cannot read properties of null/i.test(error.message)
    ) {
      return defaultTheme;
    }
    throw error;
  }
}

export function useSafeMemo(factory, _deps) {
  return factory();
}
