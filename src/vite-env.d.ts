/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_API_AUTH: string;
  readonly VITE_API_IMAGE_URL: string;
  readonly VITE_API_START: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
