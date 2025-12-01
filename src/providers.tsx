import React from "react";
import { ThemeProvider } from "./components/theme-provider";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider defaultTheme="system" storageKey="ui-theme">
        {children}
      </ThemeProvider>
    </I18nextProvider>
  );
}
