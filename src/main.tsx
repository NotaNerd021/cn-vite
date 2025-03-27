import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import "@/lib/i18n.js";
import { ThemeProvider } from "@/components/theme/theme-provider.tsx";
import { Toaster } from "@/components/ui/sonner.tsx";
import { Helmet } from "react-helmet";

createRoot(document.getElementById("root")!).render(
  <>
    <Helmet>
      <title>{window.location.pathname.split("/")[2]} Sub Stats</title>
      <meta
        name="description"
        content="Powered by https://github.com/MatinDehghanian"
      />
    </Helmet>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <App />
      <Toaster />
    </ThemeProvider>
  </>
);
