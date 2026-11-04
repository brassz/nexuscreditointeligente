/// <reference types="vite/client" />

interface Window {
  nexusLead?: (dados: { nome?: string; email?: string; telefone?: string }) => void;
}

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
