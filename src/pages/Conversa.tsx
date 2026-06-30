import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { onlyDigits, redirectToHome } from "@/lib/utils";

type Step = "chat" | "form" | "done";

export default function Conversa() {
  const [step, setStep] = useState<Step>("chat");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    nome: "",
    whatsapp: "",
    valor: "500",
  });

  const handleSubmit = async () => {
    if (form.nome.trim().length < 3) {
      setError("Nome deve ter no mínimo 3 caracteres.");
      return;
    }
    if (onlyDigits(form.whatsapp).length < 10) {
      setError("WhatsApp deve ter no mínimo 10 dígitos.");
      return;
    }

    setLoading(true);
    setError(null);

    const payload = {
      nome_completo: form.nome.trim(),
      whatsapp: onlyDigits(form.whatsapp),
      trabalha_clt: false,
      possui_cnpj: true,
      tempo_carteira: null,
      tempo_trabalho: null,
      possui_avalista: false,
      valor_desejado: form.valor,
      cidade: "Franca",
      origem: "conversa",
    };

    const { error: insertError } = await supabase.from("clientes").insert(payload);

    if (insertError) {
      console.error("Erro Supabase (conversa):", insertError);
      setError("Não foi possível salvar. Tente novamente.");
      setLoading(false);
      return;
    }

    setLoading(false);
    setStep("done");
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#060810]">
      <header className="border-b border-white/10 bg-[#0a0e1c] px-4 py-4">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <img
            src="/nexus-logo.png"
            alt="Crédito Inteligente"
            className="h-10 w-auto drop-shadow-[0_0_10px_rgba(0,212,255,0.5)]"
          />
          <div>
            <p className="font-display font-bold">Assistente</p>
            <p className="text-xs text-green-400">Online agora</p>
          </div>
          <button
            type="button"
            onClick={redirectToHome}
            className="ml-auto text-xs text-nexus-neon hover:underline"
          >
            Voltar
          </button>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-4 p-4">
        <div className="rounded-2xl rounded-tl-sm bg-white/10 p-4 text-sm">
          Olá! Atendemos exclusivamente empresas com CNPJ em{" "}
          <strong className="text-white">Franca, SP</strong>.
        </div>

        {step === "chat" && (
          <Button variant="cta" onClick={() => setStep("form")}>
            Quero simular crédito para CNPJ
          </Button>
        )}

        {step === "form" && (
          <Card>
            <CardContent className="space-y-4 p-6">
              <div className="space-y-2">
                <Label>Nome completo</Label>
                <Input
                  value={form.nome}
                  onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>WhatsApp com DDD</Label>
                <Input
                  value={form.whatsapp}
                  onChange={(e) => setForm((f) => ({ ...f, whatsapp: e.target.value }))}
                  inputMode="tel"
                />
              </div>
              <div className="rounded-xl border border-nexus-neon/20 bg-nexus-neon/10 px-4 py-3 text-sm text-nexus-neon">
                Atendimento exclusivo em Franca, SP
              </div>
              {error && (
                <p className="text-sm text-red-400">{error}</p>
              )}
              <Button variant="cta" className="w-full" onClick={handleSubmit} disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Enviar
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {step === "done" && (
          <div className="rounded-2xl border border-nexus-neon/30 bg-nexus-neon/10 p-6 text-center">
            <p className="font-display text-lg font-bold">Cadastro recebido!</p>
            <p className="mt-2 text-sm text-secondary">
              Nossa equipe entrará em contato em breve pelo WhatsApp.
            </p>
            <Button variant="cta" className="mt-4" onClick={redirectToHome}>
              Voltar ao início
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
