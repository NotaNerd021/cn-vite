/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PANEL_DOMAIN: string;
  readonly VITE_SHOW_CONFIGS_TAB: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}