import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import "@/lib/i18n.js";
import { ThemeProvider } from "@/components/theme/theme-provider.tsx";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
    <App />
  </ThemeProvider>
);
