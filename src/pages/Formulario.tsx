import { useState, useRef, useEffect } from "react";
import { supabase, type ClienteInsert } from "@/lib/supabase";

const CIDADES = [
  "Franca",
  "Batatais",
  "Cristais Paulista",
  "Patrocínio Paulista",
  "Restinga",
  "Ribeirão Corrente",
  "São José da Bela Vista",
  "Claraval",
  "Ibiraci",
];

const WHATSAPP_NUM = "5516982088844";

function formatMoney(v: number) {
  return v.toLocaleString("pt-BR");
}

function maskWhatsApp(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function whatsDigits(masked: string): string {
  return masked.replace(/\D/g, "");
}

type Step = "tipo" | "reprovado" | "form" | "fora" | "aprovado";

export default function Formulario() {
  const [step, setStep] = useState<Step>("tipo");
  const [tipo, setTipo] = useState<"pj" | "pf" | null>(null);
  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [cidade, setCidade] = useState("");
  const [outraCidade, setOutraCidade] = useState(false);
  const [valor, setValor] = useState(15000);
  const [countdown, setCountdown] = useState(5);
  const [saving, setSaving] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    containerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  useEffect(() => {
    if (step !== "aprovado") return;
    if (countdown <= 0) {
      const msg = encodeURIComponent(
        `Olá! Sou ${nome}, de ${cidade}. Fui pré-aprovado(a) no valor de R$ ${formatMoney(valor)} e gostaria de atendimento.`
      );
      window.location.href = `https://wa.me/${WHATSAPP_NUM}?text=${msg}`;
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [step, countdown, nome, cidade, valor]);

  function handleTipoContinuar() {
    if (tipo === "pf") setStep("reprovado");
    else if (tipo === "pj") setStep("form");
  }

  const formValid = nome.trim() && whatsDigits(whatsapp).length >= 10 && cidade && !outraCidade;

  async function handleEnviar() {
    if (!formValid || saving) return;

    if (outraCidade) {
      setStep("fora");
      return;
    }

    setSaving(true);

    const cliente: ClienteInsert = {
      nome_completo: nome.trim(),
      whatsapp: whatsDigits(whatsapp),
      trabalha_clt: false,
      possui_cnpj: true,
      tempo_carteira: null,
      tempo_trabalho: null,
      possui_avalista: false,
      valor_desejado: String(valor),
      cidade,
      regiao: "São Paulo",
      origem: "formulario",
    };

    const { error } = await supabase.from("clientes").insert(cliente);
    if (error) console.error("Erro ao salvar cliente:", error);

    if (typeof window.nexusLead === "function") {
      window.nexusLead({ nome });
    }

    setSaving(false);
    setStep("aprovado");
    setCountdown(5);
  }

  function voltar() {
    setStep("tipo");
    setTipo(null);
    setNome("");
    setWhatsapp("");
    setCidade("");
    setOutraCidade(false);
    setValor(15000);
  }

  function whatsappDireto() {
    const msg = encodeURIComponent(
      `Olá! Sou ${nome}, de ${cidade}. Fui pré-aprovado(a) no valor de R$ ${formatMoney(valor)} e gostaria de atendimento.`
    );
    window.location.href = `https://wa.me/${WHATSAPP_NUM}?text=${msg}`;
  }

  return (
    <div
      ref={containerRef}
      className="min-h-screen flex flex-col"
      style={{
        fontFamily: "'Inter', system-ui, sans-serif",
        background: "#000 url('/form-bg.png') center top / cover no-repeat fixed",
      }}
    >
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[#1a2433] bg-[rgba(33,37,37,0.92)] backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-center px-4">
          <img src="/nexus-logo.png" alt="Crédito Inteligente" className="h-6" />
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col px-6 pb-8 pt-6">

        {/* === STEP: Tipo de Cadastro === */}
        {step === "tipo" && (
          <div className="flex flex-1 flex-col">
            <h1 className="text-2xl font-medium text-[#e8eeff]" style={{ letterSpacing: "-0.3px" }}>
              Tipo de Cadastro
            </h1>
            <p className="mt-2 text-sm text-[#8b9bb8]">
              Selecione se você é Pessoa Jurídica ou Física.
            </p>

            <div className="mt-8 flex flex-col gap-4">
              {([
                { key: "pj" as const, icon: "🏢", title: "Pessoa Jurídica", desc: "Possuo CNPJ" },
                { key: "pf" as const, icon: "👤", title: "Pessoa Física", desc: "Não possuo CNPJ" },
              ]).map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setTipo(opt.key)}
                  className="flex items-center gap-4 rounded-2xl border-2 p-5 text-left transition-all duration-200 active:scale-[0.98]"
                  style={{
                    borderColor: tipo === opt.key ? "#4169E1" : "#3d4f6a",
                    background: tipo === opt.key ? "rgba(65,105,225,0.08)" : "#181818",
                  }}
                >
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#1a2433] text-2xl">
                    {opt.icon}
                  </span>
                  <div>
                    <span className="block text-base font-medium text-[#e8eeff]">{opt.title}</span>
                    <span className="block text-sm text-[#8b9bb8]">{opt.desc}</span>
                  </div>
                  <div className="ml-auto">
                    <div
                      className="flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors"
                      style={{
                        borderColor: tipo === opt.key ? "#4169E1" : "#3d4f6a",
                        background: tipo === opt.key ? "#4169E1" : "transparent",
                      }}
                    >
                      {tipo === opt.key && (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M2.5 6L5 8.5L9.5 3.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-auto pt-8">
              <button
                type="button"
                disabled={!tipo}
                onClick={handleTipoContinuar}
                className="w-full rounded-xl py-4 text-base font-medium text-white transition-all duration-200 active:scale-[0.98] disabled:opacity-40"
                style={{ background: tipo ? "#4169E1" : "#3d4f6a" }}
              >
                Continuar →
              </button>
            </div>
          </div>
        )}

        {/* === STEP: Reprovado PF === */}
        {step === "reprovado" && (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#1a2433] text-4xl">
              😔
            </div>
            <h1 className="text-2xl font-medium text-[#e8eeff]" style={{ letterSpacing: "-0.3px" }}>
              Não Atendemos Pessoa Física
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-[#8b9bb8]">
              Nossos serviços são exclusivos para{" "}
              <strong className="text-[#e8eeff]">Pessoa Jurídica (CNPJ)</strong>.
              Se você possui um CNPJ, volte e selecione a opção correta.
            </p>
            <button
              type="button"
              onClick={voltar}
              className="mt-10 w-full rounded-xl border border-[#3d4f6a] bg-transparent py-4 text-base font-medium text-[#e8eeff] transition-all active:scale-[0.98]"
            >
              ← Voltar ao Início
            </button>
          </div>
        )}

        {/* === STEP: Formulário PJ (tudo em uma tela) === */}
        {step === "form" && (
          <div className="flex flex-1 flex-col">
            <h1 className="text-2xl font-medium text-[#e8eeff]" style={{ letterSpacing: "-0.3px" }}>
              Solicitar Crédito
            </h1>
            <p className="mt-2 text-sm text-[#8b9bb8]">
              Preencha seus dados para receber sua pré-aprovação.
            </p>

            <div className="mt-6 flex flex-col gap-5">
              {/* Nome */}
              <div>
                <label className="mb-2 block text-sm font-medium text-[#8b9bb8]">Nome completo</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Digite seu nome"
                  autoComplete="name"
                  className="w-full rounded-xl border border-[#3d4f6a] bg-[#181818] px-4 py-4 text-base text-[#e8eeff] outline-none transition-colors placeholder:text-[#5c6d8a] focus:border-[#4169E1]"
                />
              </div>

              {/* WhatsApp */}
              <div>
                <label className="mb-2 block text-sm font-medium text-[#8b9bb8]">WhatsApp</label>
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(maskWhatsApp(e.target.value))}
                  placeholder="(16) 99999-9999"
                  autoComplete="tel"
                  inputMode="numeric"
                  className="w-full rounded-xl border border-[#3d4f6a] bg-[#181818] px-4 py-4 text-base text-[#e8eeff] outline-none transition-colors placeholder:text-[#5c6d8a] focus:border-[#4169E1]"
                />
              </div>

              {/* Cidade */}
              <div>
                <label className="mb-2 block text-sm font-medium text-[#8b9bb8]">Cidade</label>
                <select
                  value={cidade}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCidade(val);
                    setOutraCidade(val === "__outra__");
                  }}
                  className="w-full appearance-none rounded-xl border border-[#3d4f6a] bg-[#181818] px-4 py-4 text-base text-[#e8eeff] outline-none transition-colors focus:border-[#4169E1]"
                  style={{
                    color: cidade ? "#e8eeff" : "#5c6d8a",
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%238b9bb8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 16px center",
                    paddingRight: "44px",
                  }}
                >
                  <option value="" disabled>Selecione sua cidade</option>
                  {CIDADES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                  <option value="__outra__">Outra cidade</option>
                </select>
                {outraCidade && (
                  <p className="mt-2 text-xs text-amber-400">
                    Atendemos apenas Franca e região. Selecione outra cidade ou entre em contato.
                  </p>
                )}
              </div>

              {/* Valor */}
              <div>
                <label className="mb-2 block text-sm font-medium text-[#8b9bb8]">Valor desejado</label>
                <div className="rounded-xl border border-[#3d4f6a] bg-[#181818] px-4 py-4">
                  <p
                    className="mb-3 text-center text-3xl font-medium"
                    style={{ fontFamily: "'Inter Tight', system-ui, sans-serif", letterSpacing: "-0.4px" }}
                  >
                    <span className="text-[#8b9bb8]">R$ </span>
                    <span className="text-[#4169E1]">{formatMoney(valor)}</span>
                  </p>
                  <input
                    type="range"
                    min={500}
                    max={50000}
                    step={500}
                    value={valor}
                    onChange={(e) => setValor(Number(e.target.value))}
                    className="w-full"
                    style={{
                      height: "6px",
                      appearance: "none",
                      WebkitAppearance: "none",
                      background: `linear-gradient(to right, #4169E1 ${((valor - 500) / 49500) * 100}%, #1a2433 ${((valor - 500) / 49500) * 100}%)`,
                      borderRadius: "3px",
                      outline: "none",
                    }}
                  />
                  <div className="mt-1 flex justify-between text-xs text-[#5c6d8a]">
                    <span>R$ 500</span>
                    <span>R$ 50.000</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-auto pt-6">
              <button
                type="button"
                disabled={!formValid || saving}
                onClick={() => void handleEnviar()}
                className="w-full rounded-xl py-4 text-base font-medium text-white transition-all duration-200 active:scale-[0.98] disabled:opacity-40"
                style={{ background: formValid && !saving ? "#4169E1" : "#3d4f6a" }}
              >
                {saving ? "Enviando..." : "Enviar Solicitação →"}
              </button>
              <button
                type="button"
                onClick={voltar}
                className="mt-3 w-full py-3 text-sm text-[#5c6d8a] transition-colors active:text-[#8b9bb8]"
              >
                ← Voltar
              </button>
            </div>
          </div>
        )}

        {/* === STEP: Fora da área === */}
        {step === "fora" && (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#1a2433] text-4xl">
              📍
            </div>
            <h1 className="text-2xl font-medium text-[#e8eeff]" style={{ letterSpacing: "-0.3px" }}>
              Fora da Área de Atendimento
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-[#8b9bb8]">
              Infelizmente sua cidade está fora da nossa cobertura. Atualmente atendemos:
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {CIDADES.map((c) => (
                <span key={c} className="rounded-full bg-[#1a2433] px-3 py-1.5 text-xs text-[#8b9bb8]">
                  {c}
                </span>
              ))}
            </div>
            <button
              type="button"
              onClick={voltar}
              className="mt-10 w-full rounded-xl border border-[#3d4f6a] bg-transparent py-4 text-base font-medium text-[#e8eeff] transition-all active:scale-[0.98]"
            >
              ← Voltar ao Início
            </button>
          </div>
        )}

        {/* === STEP: Aprovado === */}
        {step === "aprovado" && (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[rgba(65,105,225,0.12)] text-4xl">
              🎉
            </div>
            <h1 className="text-2xl font-medium text-[#e8eeff]" style={{ letterSpacing: "-0.3px" }}>
              Parabéns! Você foi pré-aprovado!
            </h1>
            <p className="mt-3 text-sm text-[#8b9bb8]">
              Aguarde, você será redirecionado para um atendente.
            </p>
            <p className="mt-6 text-sm text-[#5c6d8a]">
              ⏳ Redirecionando em{" "}
              <span className="font-medium text-[#4169E1]">{countdown}</span> segundos
            </p>
            <button
              type="button"
              onClick={whatsappDireto}
              className="mt-8 flex w-full items-center justify-center gap-3 rounded-xl py-4 text-base font-medium text-white transition-all duration-200 active:scale-[0.98]"
              style={{ background: "#25D366" }}
            >
              <svg width="22" height="22" viewBox="0 0 32 32" fill="currentColor">
                <path d="M16.004 3C8.832 3 3 8.83 3 16c0 2.29.6 4.53 1.74 6.5L3 29l6.68-1.75A12.95 12.95 0 0 0 16.004 29C23.17 29 29 23.17 29 16S23.17 3 16.004 3zm0 23.62c-2.03 0-4.02-.55-5.75-1.58l-.41-.24-3.96 1.04 1.06-3.86-.27-.4A10.6 10.6 0 0 1 5.38 16c0-5.86 4.77-10.62 10.63-10.62 5.85 0 10.61 4.76 10.61 10.62 0 5.86-4.76 10.62-10.62 10.62zm5.82-7.95c-.32-.16-1.89-.93-2.18-1.04-.29-.11-.5-.16-.72.16-.21.32-.82 1.04-1.01 1.25-.19.21-.37.24-.69.08-.32-.16-1.35-.5-2.57-1.59-.95-.85-1.59-1.9-1.78-2.22-.19-.32-.02-.49.14-.65.14-.14.32-.37.48-.56.16-.19.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.72-1.73-.98-2.37-.26-.62-.52-.54-.72-.55h-.61c-.21 0-.56.08-.85.4-.29.32-1.12 1.09-1.12 2.66s1.15 3.09 1.31 3.3c.16.21 2.26 3.45 5.47 4.84.76.33 1.36.53 1.83.68.77.24 1.47.21 2.02.13.62-.09 1.89-.77 2.16-1.52.27-.75.27-1.39.19-1.52-.08-.13-.29-.21-.61-.37z" />
              </svg>
              Falar Agora pelo WhatsApp
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1a2433] px-6 py-4 text-center text-xs text-[#5c6d8a]">
        © 2026 Crédito Inteligente · Franca e Região
      </footer>

      <style>{`
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #4169E1;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(65,105,225,0.4);
        }
        input[type=range]::-moz-range-thumb {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #4169E1;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 8px rgba(65,105,225,0.4);
        }
        select option {
          background: #181818;
          color: #e8eeff;
        }
      `}</style>
    </div>
  );
}
