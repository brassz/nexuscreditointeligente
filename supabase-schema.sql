-- Nexus Crédito Inteligente — Schema Supabase
-- Execute no SQL Editor do Supabase

CREATE TABLE IF NOT EXISTS clientes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome_completo TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  trabalha_clt BOOLEAN NOT NULL DEFAULT false,
  possui_cnpj BOOLEAN,
  tempo_carteira TEXT,
  tempo_trabalho TEXT,
  profissao TEXT,
  possui_avalista BOOLEAN NOT NULL DEFAULT false,
  valor_desejado TEXT NOT NULL,
  regiao TEXT,
  cidade TEXT NOT NULL,
  contatado BOOLEAN NOT NULL DEFAULT false,
  origem TEXT DEFAULT 'conversa',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clientes_created_at ON clientes (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_clientes_contatado ON clientes (contatado);

ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir insert publico" ON clientes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir select publico" ON clientes
  FOR SELECT USING (true);

CREATE POLICY "Permitir update publico" ON clientes
  FOR UPDATE USING (true);
