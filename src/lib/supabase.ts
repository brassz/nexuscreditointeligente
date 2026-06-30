import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(
  supabaseUrl ?? "https://placeholder.supabase.co",
  supabaseAnonKey ?? "placeholder-key"
);

export interface Cliente {
  id: string;
  nome_completo: string;
  whatsapp: string;
  trabalha_clt: boolean;
  possui_cnpj: boolean | null;
  tempo_carteira: string | null;
  tempo_trabalho: string | null;
  profissao?: string | null;
  possui_avalista: boolean;
  valor_desejado: string;
  regiao?: string | null;
  cidade: string;
  cnpj?: string | null;
  contatado: boolean;
  origem?: string | null;
  created_at: string;
}

export type ClienteInsert = Omit<Cliente, "id" | "created_at" | "contatado"> & {
  contatado?: boolean;
};
