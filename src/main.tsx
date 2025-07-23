import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import "@/lib/i18n.js";
import { ThemeProvider } from "@/components/theme/theme-provider.tsx";
import { Toaster } from "@/components/ui/sonner.tsx";
import ErrorBoundary from "@/components/ErrorBoundary.tsx";

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <App />
      <Toaster />
    </ThemeProvider>
  </ErrorBoundary>
);
