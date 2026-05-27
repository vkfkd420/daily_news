/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME: string;
  readonly VITE_AUTO_SYNC_ON_LOAD?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
