/**
 * @file src/contexts/ThemeContext.tsx
 * Theme & UI Context for Q-OPTIMA Palette State
 */

import React, { createContext, useContext, useState } from 'react';

interface ThemeContextType {
  theme: string;
  setTheme: (theme: string) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'Dark IBM Quantum',
  setTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<string>('Dark IBM Quantum');

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div className={theme.toLowerCase().includes('dark') ? 'dark' : ''}>{children}</div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
