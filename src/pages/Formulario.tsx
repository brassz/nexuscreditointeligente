import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/lib/supabase";
import { cn, formatCurrency, onlyDigits, redirectToHome } from "@/lib/utils";

type StepId =
  | "welcome"
  | "valor"
  | "clt"
  | "tempo_carteira"
  | "cnpj"
  | "atividade_cnpj"
  | "regiao"
  | "cidade"
  | "avalista"
  | "contato"
  | "success";

interface FormData {
  valor: number;
  trabalhaClt: boolean | null;
  tempoCarteira: string;
  possuiCnpj: boolean | null;
  atividadeCnpj: string;
  regiao: string;
  cidade: string;
  empresaEmFranca: boolean | null;
  possuiAvalista: boolean | null;
  nomeCompleto: string;
  whatsapp: string;
}

const CIDADE_ATENDIDA = "Franca";
const REGIAO_ATENDIDA = "São Paulo";

const initialForm: FormData = {
  valor: 500,
  trabalhaClt: null,
  tempoCarteira: "",
  possuiCnpj: null,
  atividadeCnpj: "",
  regiao: REGIAO_ATENDIDA,
  cidade: CIDADE_ATENDIDA,
  empresaEmFranca: null,
  possuiAvalista: null,
  nomeCompleto: "",
  whatsapp: "",
};

function YesNoButtons({
  value,
  onChange,
}: {
  value: boolean | null;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {[true, false].map((opt) => (
        <button
          key={String(opt)}
          type="button"
          onClick={() => onChange(opt)}
          className={cn(
            "rounded-xl border px-4 py-4 text-sm font-semibold transition-all duration-200",
            value === opt
              ? "border-nexus-neon bg-nexus-neon/15 text-nexus-neon shadow-lg shadow-nexus-neon/20 scale-[1.02]"
              : "border-white/10 bg-white/5 text-white/80 hover:border-white/20 hover:bg-white/10"
          )}
        >
          {opt ? "Sim" : "Não"}
        </button>
      ))}
    </div>
  );
}

export default function Formulario() {
  const [step, setStep] = useState<StepId>("welcome");
  const [form, setForm] = useState<FormData>(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const steps = useMemo((): StepId[] => {
    return [
      "welcome",
      "valor",
      "atividade_cnpj",
      "cidade",
      "avalista",
      "contato",
      "success",
    ];
  }, []);

  const currentIndex = steps.indexOf(step);
  const progressSteps = steps.filter(
    (s): s is Exclude<StepId, "welcome" | "success"> =>
      s !== "welcome" && s !== "success"
  );
  const progressIndex = progressSteps.indexOf(
    step as Exclude<StepId, "welcome" | "success">
  );
  const progressPercent =
    step === "welcome"
      ? 0
      : step === "success"
        ? 100
        : ((progressIndex + 1) / progressSteps.length) * 100;

  const goNext = () => {
    const idx = steps.indexOf(step);
    if (idx < steps.length - 1) setStep(steps[idx + 1]);
  };

  const goBack = () => {
    const idx = steps.indexOf(step);
    if (idx > 0) setStep(steps[idx - 1]);
  };

  const validateStep = (): string | null => {
    switch (step) {
      case "valor":
        return form.valor >= 100 ? null : "Selecione um valor válido.";
      case "atividade_cnpj":
        return form.atividadeCnpj.trim().length >= 3
          ? null
          : "Informe sua atividade (mínimo 3 caracteres).";
      case "cidade":
        if (form.empresaEmFranca === false) {
          return "No momento atendemos apenas empresas em Franca, SP.";
        }
        return form.empresaEmFranca === true ? null : "Confirme se sua empresa está em Franca.";
      case "avalista":
        return form.possuiAvalista !== null ? null : "Selecione uma opção.";
      case "contato": {
        if (form.nomeCompleto.trim().length < 3) {
          return "Nome completo deve ter no mínimo 3 caracteres.";
        }
        if (onlyDigits(form.whatsapp).length < 10) {
          return "WhatsApp deve ter no mínimo 10 dígitos.";
        }
        return null;
      }
      default:
        return null;
    }
  };

  const handleContinue = async () => {
    setError(null);
    if (step === "welcome") {
      goNext();
      return;
    }
    if (step === "contato") {
      const validationError = validateStep();
      if (validationError) {
        setError(validationError);
        return;
      }
      await submitForm();
      return;
    }
    const validationError = validateStep();
    if (validationError) {
      setError(validationError);
      return;
    }
    goNext();
  };

  const submitForm = async () => {
    setLoading(true);
    setError(null);

    const payload = {
      nome_completo: form.nomeCompleto.trim(),
      whatsapp: onlyDigits(form.whatsapp),
      trabalha_clt: false,
      possui_cnpj: true,
      tempo_carteira: null,
      tempo_trabalho: null as string | null,
      profissao: form.atividadeCnpj.trim(),
      possui_avalista: form.possuiAvalista ?? false,
      valor_desejado: String(form.valor),
      regiao: form.regiao,
      cidade: form.cidade.trim(),
      origem: "formulario",
    };

    let { error: insertError } = await supabase.from("clientes").insert(payload);

    if (insertError) {
      console.error("Erro Supabase (insert completo):", insertError);
      const cidadeComRegiao = form.regiao
        ? `${form.cidade.trim()} (${form.regiao})`
        : form.cidade.trim();

      const fallbackPayload = {
        nome_completo: payload.nome_completo,
        whatsapp: payload.whatsapp,
        trabalha_clt: payload.trabalha_clt,
        possui_cnpj: payload.possui_cnpj,
        tempo_carteira: payload.tempo_carteira,
        tempo_trabalho: null as string | null,
        possui_avalista: payload.possui_avalista,
        valor_desejado: payload.valor_desejado,
        cidade: cidadeComRegiao,
      };

      const { error: fallbackError } = await supabase
        .from("clientes")
        .insert(fallbackPayload);

      if (fallbackError) {
        console.error("Erro Supabase (insert fallback):", fallbackError);
        setError(
          "Não foi possível enviar seu cadastro. Tente novamente em instantes."
        );
        setLoading(false);
        return;
      }
    }

    setLoading(false);
    setStep("success");
  };

  return (
    <div className="min-h-screen bg-[#060810]">
      <header className="hero-gradient border-b border-white/10">
        <div className="container-custom flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <img
              src="/nexus-logo.png"
              alt="Crédito Inteligente"
              className="h-9 w-auto drop-shadow-[0_0_12px_rgba(0,212,255,0.5)]"
            />
            <h1 className="mt-2 text-sm text-white/70">
              Empréstimo para CNPJ · Franca, SP
            </h1>
          </div>
          <button
            type="button"
            onClick={redirectToHome}
            className="inline-flex items-center gap-2 text-sm text-nexus-neon hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao site
          </button>
        </div>
      </header>

      <div className="container-custom py-8">
        {step !== "welcome" && step !== "success" && (
          <div className="mx-auto mb-6 max-w-lg">
            <div className="mb-2 flex justify-between text-xs text-muted-foreground">
              <span>Progresso</span>
              <span>{Math.round(progressPercent)}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full bg-gradient-to-r from-[#0057FF] to-[#00C0FF]"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>
          </div>
        )}

        <Card className="mx-auto max-w-lg">
          <CardContent className="p-6 sm:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                {step === "welcome" && (
                  <>
                    <div className="text-center">
                      <h2 className="font-display text-2xl font-bold text-white">
                        Crédito para sua empresa
                      </h2>
                      <p className="mt-3 text-secondary">
                        Atendemos exclusivamente empresas e MEIs com CNPJ ativo em{" "}
                        <strong className="text-white">Franca, SP</strong>.
                        Preencha os dados e simule a melhor condição.
                      </p>
                    </div>
                    <Button
                      variant="cta"
                      size="lg"
                      className="w-full"
                      onClick={handleContinue}
                    >
                      Começar Simulação
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </>
                )}

                {step === "valor" && (
                  <>
                    <div>
                      <h2 className="font-display text-xl font-bold">
                        Quanto sua empresa precisa?
                      </h2>
                      <p className="mt-1 text-sm text-secondary">
                        Arraste o slider para definir o valor desejado.
                      </p>
                    </div>
                    <div className="rounded-xl bg-white/5 p-6 text-center">
                      <p className="text-sm text-secondary">Valor selecionado</p>
                      <p className="font-display text-4xl font-bold text-nexus-neon">
                        {formatCurrency(form.valor)}
                      </p>
                    </div>
                    <Slider
                      min={100}
                      max={2000}
                      step={50}
                      value={[form.valor]}
                      onValueChange={([v]) =>
                        setForm((f) => ({ ...f, valor: v }))
                      }
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>R$ 100</span>
                      <span>R$ 2.000</span>
                    </div>
                  </>
                )}

                {step === "atividade_cnpj" && (
                  <>
                    <h2 className="font-display text-xl font-bold">
                      Qual é a atividade da empresa?
                    </h2>
                    <div className="space-y-2">
                      <Label htmlFor="atividade">Ramo / segmento do CNPJ</Label>
                      <Input
                        id="atividade"
                        value={form.atividadeCnpj}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, atividadeCnpj: e.target.value }))
                        }
                        placeholder="Ex: Comércio varejista, restaurante, transportes"
                      />
                    </div>
                  </>
                )}

                {step === "cidade" && (
                  <>
                    <h2 className="font-display text-xl font-bold">
                      Sua empresa está em Franca, SP?
                    </h2>
                    <p className="text-sm text-secondary">
                      Atendemos exclusivamente a cidade de{" "}
                      <strong className="text-white">Franca</strong>.
                    </p>
                    <div className="rounded-xl border border-nexus-neon/20 bg-nexus-neon/10 px-4 py-3 text-center text-sm text-nexus-neon">
                      Área de atendimento: Franca · São Paulo
                    </div>
                    <YesNoButtons
                      value={form.empresaEmFranca}
                      onChange={(v) =>
                        setForm((f) => ({
                          ...f,
                          empresaEmFranca: v,
                          cidade: v ? CIDADE_ATENDIDA : "",
                          regiao: v ? REGIAO_ATENDIDA : "",
                        }))
                      }
                    />
                  </>
                )}

                {step === "avalista" && (
                  <>
                    <h2 className="font-display text-xl font-bold">
                      Possui avalista?
                    </h2>
                    <YesNoButtons
                      value={form.possuiAvalista}
                      onChange={(v) =>
                        setForm((f) => ({ ...f, possuiAvalista: v }))
                      }
                    />
                  </>
                )}

                {step === "contato" && (
                  <>
                    <h2 className="font-display text-xl font-bold">
                      Seus dados de contato
                    </h2>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="nome">Nome completo</Label>
                        <Input
                          id="nome"
                          value={form.nomeCompleto}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, nomeCompleto: e.target.value }))
                          }
                          placeholder="Seu nome completo"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="whatsapp">WhatsApp com DDD</Label>
                        <Input
                          id="whatsapp"
                          value={form.whatsapp}
                          onChange={(e) =>
                            setForm((f) => ({ ...f, whatsapp: e.target.value }))
                          }
                          placeholder="(16) 99999-9999"
                          inputMode="tel"
                        />
                      </div>
                    </div>
                  </>
                )}

                {step === "success" && (
                  <div className="py-4 text-center">
                    <CheckCircle2 className="mx-auto h-16 w-16 text-nexus-neon" />
                    <h2 className="mt-4 font-display text-2xl font-bold">
                      Cadastro enviado com sucesso!
                    </h2>
                    <p className="mt-3 text-secondary">
                      Nossa equipe entrará em contato
                      em breve.
                    </p>
                    <Button variant="cta" size="lg" className="mt-6" onClick={redirectToHome}>
                      Voltar ao início
                    </Button>
                  </div>
                )}

                {error && (
                  <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    {error}
                  </p>
                )}

                {step !== "welcome" && step !== "success" && (
                  <div className="flex gap-3 pt-2">
                    <Button
                      variant="glass"
                      className="flex-1"
                      onClick={goBack}
                      disabled={loading || currentIndex <= 1}
                    >
                      Voltar
                    </Button>
                    <Button
                      variant="cta"
                      className="flex-1"
                      onClick={handleContinue}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Enviando...
                        </>
                      ) : step === "contato" ? (
                        "Enviar cadastro"
                      ) : (
                        <>
                          Continuar
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
