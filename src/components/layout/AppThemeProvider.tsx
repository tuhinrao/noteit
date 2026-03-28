"use client";

import { CssBaseline, ThemeProvider } from "@mui/material";
import { ReactNode } from "react";
import { appTheme } from "@/theme/theme";

interface AppThemeProviderProps {
  children: ReactNode;
}

export default function AppThemeProvider({ children }: AppThemeProviderProps) {
  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}