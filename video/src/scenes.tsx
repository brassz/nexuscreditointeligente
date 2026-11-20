// AS SETE CENAS DO VÍDEO.
// Os textos da tela estão aqui; os números `at={...}` são frames dentro da cena
// (30 frames = 1 segundo) e foram posicionados para acompanhar a narração.
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import {
  Eyebrow,
  Glass,
  Icon,
  IconTile,
  LightLine,
  Logo,
  LogoReveal,
  Phone,
  Rise,
  Words,
  lerp,
  ramp,
} from "./components";
import { AVISO, C, GRADIENT, LEGAL, SITE } from "./theme";
import { body, display, mono } from "./fonts";

type SceneProps = { dur: number };
const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const gradientText: React.CSSProperties = {
  backgroundImage: GRADIENT,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
};

/** Curva suave passando pelos pontos (para os gráficos). */
const smoothPath = (pts: [number, number][]) =>
  pts
    .map(([x, y], i) => {
      if (i === 0) return `M${x} ${y}`;
      const [px, py] = pts[i - 1];
      const mx = (px + x) / 2;
      return `C${mx} ${py} ${mx} ${y} ${x} ${y}`;
    })
    .join(" ");

/** Cartão flutuando em 3D, com leve balanço. */
const Floating: React.FC<{
  at: number;
  x: number;
  y: number;
  tilt?: number;
  phase?: number;
  children: React.ReactNode;
}> = ({ at, x, y, tilt = 0, phase = 0, children }) => {
  const frame = useCurrentFrame();
  const a = ramp(frame, at, 30);
  const bob = Math.sin(frame / 34 + phase) * 8;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        opacity: a,
        transform: `perspective(1400px) translateY(${(1 - a) * 50 + bob}px) rotateY(${tilt + (1 - a) * 18}deg) scale(${lerp(0.9, 1, a)})`,
        filter: a < 1 ? `blur(${(1 - a) * 8}px)` : undefined,
      }}
    >
      {children}
    </div>
  );
};

const Chip: React.FC<{ icon: string; title: string; sub?: string; dot?: string }> = ({
  icon,
  title,
  sub,
  dot,
}) => (
  <Glass style={{ display: "flex", alignItems: "center", gap: 20, padding: "22px 30px 22px 22px", borderRadius: 24 }}>
    <IconTile name={icon} size={62} />
    <div>
      <div style={{ fontFamily: display, fontSize: 30, fontWeight: 500, letterSpacing: "-0.01em", whiteSpace: "nowrap" }}>
        {title}
      </div>
      {sub && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6, fontSize: 21, color: C.muted, whiteSpace: "nowrap" }}>
          {dot && <span style={{ width: 9, height: 9, borderRadius: 9, background: dot, boxShadow: `0 0 12px ${dot}` }} />}
          {sub}
        </div>
      )}
    </div>
  </Glass>
);

// ====================================================================
// CENA 01 — ABERTURA
// ====================================================================
export const Abertura: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <LightLine at={6} out={44} y={420} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 96, display: "flex", justifyContent: "center" }}>
        <LogoReveal at={34} size={620} />
      </div>
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 760,
          width: 520 * ramp(frame, 104, 40),
          height: 1,
          transform: "translateX(-50%)",
          background: `linear-gradient(90deg, transparent, ${C.borderStrong}, transparent)`,
        }}
      />
      <div style={{ position: "absolute", left: 0, right: 0, top: 800, textAlign: "center" }}>
        <Words
          text="Crédito empresarial para quem faz acontecer."
          at={112}
          stagger={4}
          accent={["faz", "acontecer"]}
          style={{ fontSize: 54, fontWeight: 400 }}
        />
      </div>
    </AbsoluteFill>
  );
};

// ====================================================================
// CENA 02 — O PROBLEMA DO EMPRESÁRIO
// ====================================================================
const CASH: [number, number][] = [
  [0, 150], [95, 118], [190, 140], [285, 96], [380, 128], [475, 168], [570, 214], [665, 252], [780, 286],
];

export const Problema: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const draw = interpolate(frame, [26, 200], [0, 1], CLAMP);
  const gap = ramp(frame, 196, 36);
  const panel = ramp(frame, 8, 36);
  const line = smoothPath(CASH);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 130, top: 300, width: 780 }}>
        <Eyebrow at={10}>O desafio</Eyebrow>
        <div style={{ position: "relative", marginTop: 34, height: 420 }}>
          <div style={{ position: "absolute", inset: 0 }}>
            <Words text={"Sua empresa\nprecisa crescer?"} at={18} out={150} accent={["crescer"]} style={{ fontSize: 98 }} />
          </div>
          <div style={{ position: "absolute", inset: 0 }}>
            <Words
              text={"Precisa de capital\npara continuar\navançando?"}
              at={164}
              accent={["capital"]}
              style={{ fontSize: 88 }}
            />
          </div>
        </div>
      </div>

      {/* painel de fluxo de caixa (ilustrativo, sem valores) */}
      <div style={{ position: "absolute", left: 980, top: 250, perspective: 1800 }}>
        <Glass
          style={{
            width: 840,
            height: 540,
            padding: 34,
            opacity: panel,
            transform: `rotateY(${lerp(-30, -13, panel)}deg) rotateX(5deg) translateY(${(1 - panel) * 60}px)`,
            transformOrigin: "50% 50%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <IconTile name="chart" size={52} />
            <div style={{ fontFamily: display, fontSize: 32, fontWeight: 500 }}>Fluxo de caixa</div>
          </div>
          <svg width={780} height={380} viewBox="0 0 780 380" style={{ marginTop: 26, overflow: "visible" }}>
            <defs>
              <linearGradient id="cashLine" x1="0" x2="1">
                <stop offset="0" stopColor={C.cyan} />
                <stop offset="0.55" stopColor={C.royal} />
                <stop offset="1" stopColor={C.amber} />
              </linearGradient>
              <linearGradient id="gapFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor={C.amber} stopOpacity="0.30" />
                <stop offset="1" stopColor={C.amber} stopOpacity="0.03" />
              </linearGradient>
            </defs>
            {[60, 140, 220, 300].map((y) => (
              <line key={y} x1={0} x2={780} y1={y} y2={y} stroke="rgba(120,150,210,0.10)" />
            ))}
            {/* compromissos do mês: a linha que o caixa precisa alcançar */}
            <line x1={0} x2={780} y1={178} y2={178} stroke={C.muted} strokeDasharray="8 10" strokeWidth={2} opacity={0.75} />
            <text x={780} y={162} fill={C.muted} fontFamily={body} fontSize={20} textAnchor="end">
              Compromissos do mês
            </text>
            <path
              d={`M494 178 C522 191 546 203 570 214 C617 233 617 252 665 252 C722 252 722 286 780 286 L780 178 Z`}
              fill="url(#gapFill)"
              opacity={gap}
            />
            <path d={line} stroke="url(#cashLine)" strokeWidth={10} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - draw} opacity={0.25} style={{ filter: "blur(10px)" }} />
            <path d={line} stroke="url(#cashLine)" strokeWidth={4.5} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - draw} />
            <g opacity={gap}>
              <circle cx={780} cy={286} r={10 + 5 * Math.sin(frame / 6)} fill={C.amber} opacity={0.25} />
              <circle cx={780} cy={286} r={7} fill={C.amber} />
              <text x={780} y={340} fill={C.amber} fontFamily={body} fontSize={24} fontWeight={500} textAnchor="end">
                Necessidade de capital
              </text>
            </g>
            <text x={0} y={372} fill={C.dim} fontFamily={body} fontSize={20}>
              Caixa disponível
            </text>
            <text x={780} y={372} fill={C.dim} fontFamily={mono} fontSize={17} letterSpacing="0.14em" textAnchor="end">
              GRÁFICO ILUSTRATIVO
            </text>
          </svg>
        </Glass>
      </div>

      <Floating at={30} x={900} y={170} tilt={-8} phase={0}>
        <Chip icon="truck" title="Fornecedores" sub="Pagamento a vencer" dot={C.amber} />
      </Floating>
      <Floating at={76} x={1470} y={196} tilt={-12} phase={2}>
        <Chip icon="box" title="Estoque" sub="Reposição necessária" dot={C.amber} />
      </Floating>
      <Floating at={124} x={1300} y={800} tilt={-10} phase={4}>
        <Chip icon="bolt" title="Oportunidade" sub="Não pode esperar" dot={C.cyan} />
      </Floating>
    </AbsoluteFill>
  );
};

// ====================================================================
// CENA 03 — APRESENTAÇÃO DA SOLUÇÃO
// ====================================================================
const RISE: [number, number][] = [
  [-40, 1000], [260, 960], [520, 975], [800, 915], [1080, 900], [1360, 820], [1640, 780], [1960, 640],
];

export const Solucao: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const draw = interpolate(frame, [0, 150], [0, 1], CLAMP);
  const mark = ramp(frame, 8, 34);
  return (
    <AbsoluteFill>
      {/* a linha do caixa agora sobe: continuidade visual com a cena anterior */}
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: 0.5 }}>
        <defs>
          <linearGradient id="riseLine" x1="0" x2="1">
            <stop offset="0" stopColor={C.royal} stopOpacity="0" />
            <stop offset="0.4" stopColor={C.royal} />
            <stop offset="1" stopColor={C.cyan} />
          </linearGradient>
        </defs>
        <path d={smoothPath(RISE)} stroke="url(#riseLine)" strokeWidth={14} fill="none" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - draw} opacity={0.3} style={{ filter: "blur(14px)" }} />
        <path d={smoothPath(RISE)} stroke="url(#riseLine)" strokeWidth={3} fill="none" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - draw} />
      </svg>

      <div style={{ position: "absolute", left: 0, right: 0, top: 150, display: "flex", justifyContent: "center" }}>
        <Logo
          variant="mark"
          size={250}
          style={{
            opacity: mark,
            transform: `scale(${lerp(1.3, 1, mark)})`,
            filter: `blur(${(1 - mark) * 16}px) drop-shadow(0 0 40px rgba(56,198,244,0.45))`,
          }}
        />
      </div>

      <div style={{ position: "absolute", left: 0, right: 0, top: 368, textAlign: "center" }}>
        <Words text="Conheça a" at={22} style={{ fontSize: 72, fontWeight: 400, color: C.muted }} />
        <Words
          text="Nexus Crédito Inteligente."
          at={30}
          stagger={5}
          accent={["Nexus", "Crédito", "Inteligente"]}
          style={{ fontSize: 124, marginTop: 10 }}
        />
        <Rise at={176} style={{ marginTop: 44 }}>
          <div style={{ fontFamily: body, fontSize: 42, color: C.text, letterSpacing: "-0.01em" }}>
            Uma solução pensada para empresas com{" "}
            <span style={{ fontWeight: 600, ...gradientText }}>CNPJ ativo</span>.
          </div>
        </Rise>
      </div>

      <Floating at={118} x={130} y={190} tilt={14} phase={0}>
        <Chip icon="coin" title="Crédito empresarial" />
      </Floating>
      <Floating at={146} x={1400} y={176} tilt={-14} phase={2}>
        <Chip icon="growth" title="Capital de giro" />
      </Floating>
      <Floating at={226} x={250} y={830} tilt={12} phase={4}>
        <Chip icon="building" title="CNPJ ativo" />
      </Floating>
      <Floating at={270} x={1330} y={846} tilt={-12} phase={1}>
        <Chip icon="user" title="Inclui MEI" />
      </Floating>
    </AbsoluteFill>
  );
};

// ====================================================================
// CENA 04 — NOSSO GRANDE DIFERENCIAL
// ====================================================================
const ROWS = [
  { icon: "chart", title: "Faturamento", sub: "Informações financeiras da empresa", at: 150 },
  { icon: "activity", title: "Atividade", sub: "Segmento e operação do negócio", at: 196 },
  { icon: "clock", title: "Histórico", sub: "Trajetória da empresa", at: 242 },
];

const Bullet: React.FC<{ at: number; icon: string; children: React.ReactNode }> = ({ at, icon, children }) => (
  <Rise at={at} style={{ display: "flex", alignItems: "center", gap: 24, marginTop: 30 }}>
    <IconTile name={icon} size={60} />
    <div style={{ fontFamily: display, fontSize: 42, fontWeight: 500, letterSpacing: "-0.015em", color: C.text, lineHeight: 1.12 }}>
      {children}
    </div>
  </Rise>
);

export const Diferencial: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const panel = ramp(frame, 40, 40);
  const scan = interpolate(frame, [130, 300], [0, 1], CLAMP);
  const bureaus = ramp(frame, 286, 30);
  const done = frame >= 310;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 130, top: 200, width: 820 }}>
        <Eyebrow at={12}>Nosso diferencial</Eyebrow>
        <Words
          text={"Análise interna\nda empresa."}
          at={66}
          stagger={4}
          accent={["Análise", "interna"]}
          style={{ fontSize: 104, marginTop: 30 }}
        />
        <div style={{ marginTop: 50 }}>
          <Bullet at={282} icon="ban">
            Sem consulta aos birôs
            <br />
            externos de crédito.
          </Bullet>
          <Bullet at={372} icon="check">
            Mais simplicidade no processo.
          </Bullet>
        </div>
      </div>

      <div style={{ position: "absolute", left: 1010, top: 150, perspective: 1900 }}>
        <Glass
          style={{
            position: "relative",
            width: 790,
            padding: "34px 38px 38px",
            overflow: "hidden",
            opacity: panel,
            transform: `rotateY(${lerp(-28, -11, panel)}deg) rotateX(4deg) translateY(${(1 - panel) * 60}px)`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontFamily: mono, fontSize: 17, letterSpacing: "0.18em", color: C.cyan }}>NEXUS</div>
              <div style={{ fontFamily: display, fontSize: 34, fontWeight: 500, marginTop: 6 }}>Análise interna da empresa</div>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 18px",
                borderRadius: 999,
                border: `1px solid ${C.border}`,
                fontSize: 20,
                color: C.text,
                whiteSpace: "nowrap",
              }}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 10,
                  background: C.cyan,
                  opacity: done ? 1 : 0.45 + 0.55 * Math.abs(Math.sin(frame / 7)),
                  boxShadow: `0 0 12px ${C.cyan}`,
                }}
              />
              {done ? "Em avaliação pela Nexus" : "Analisando dados"}
            </div>
          </div>

          <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 16 }}>
            {ROWS.map((row) => {
              const a = ramp(frame, row.at - 60, 28);
              const fill = interpolate(frame, [row.at, row.at + 62], [0, 1], CLAMP);
              const ok = fill >= 1;
              return (
                <div
                  key={row.title}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 22,
                    padding: "20px 24px",
                    borderRadius: 20,
                    background: "rgba(8, 14, 28, 0.6)",
                    border: `1px solid ${fill > 0 && !ok ? C.borderStrong : C.border}`,
                    opacity: 0.35 + 0.65 * a,
                  }}
                >
                  <IconTile name={row.icon} size={60} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <div style={{ fontFamily: display, fontSize: 30, fontWeight: 500 }}>{row.title}</div>
                      <div style={{ fontFamily: mono, fontSize: 17, letterSpacing: "0.08em", color: ok ? C.cyan : C.dim }}>
                        {ok ? "DADOS AVALIADOS" : fill > 0 ? "AVALIANDO…" : "NA FILA"}
                      </div>
                    </div>
                    <div style={{ fontSize: 20, color: C.muted, marginTop: 4 }}>{row.sub}</div>
                    <div style={{ height: 6, borderRadius: 6, background: "rgba(120,150,210,0.14)", marginTop: 14, overflow: "hidden" }}>
                      <div style={{ width: `${fill * 100}%`, height: "100%", borderRadius: 6, background: GRADIENT, boxShadow: `0 0 14px ${C.cyan}` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div
            style={{
              marginTop: 18,
              display: "flex",
              alignItems: "center",
              gap: 22,
              padding: "18px 24px",
              borderRadius: 20,
              border: `1px dashed ${C.border}`,
              opacity: bureaus,
              transform: `translateY(${(1 - bureaus) * 20}px)`,
            }}
          >
            <Icon name="ban" size={36} color={C.muted} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: display, fontSize: 26, fontWeight: 500, color: C.muted }}>
                Birôs externos · Serasa e SPC
              </div>
              <div style={{ fontSize: 20, color: C.dim, marginTop: 2 }}>Não consultados nesta modalidade</div>
            </div>
          </div>

          {/* feixe de leitura passando pelos dados */}
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: `${lerp(16, 78, scan)}%`,
              height: 90,
              opacity: scan > 0 && scan < 1 ? 0.6 : 0,
              background: `linear-gradient(180deg, transparent, rgba(56,198,244,0.10) 80%, rgba(56,198,244,0.55) 100%)`,
              borderBottom: `1px solid ${C.cyan}`,
            }}
          />
        </Glass>
      </div>

      <Rise at={398} style={{ position: "absolute", left: 130, bottom: 84, display: "flex", alignItems: "center", gap: 16 }}>
        <Icon name="shield" size={34} color={C.muted} />
        <div style={{ fontFamily: body, fontSize: 28, color: C.muted }}>{AVISO}</div>
      </Rise>
    </AbsoluteFill>
  );
};

// ====================================================================
// CENA 05 — CONTRATAÇÃO 100% ONLINE
// ====================================================================
const brl = (value: number) => "R$ " + Math.round(value).toLocaleString("pt-BR");

const ScreenHeader: React.FC<{ step: string; title: string }> = ({ step, title }) => (
  <div style={{ padding: "74px 30px 0" }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <Logo variant="mark" size={58} />
      <div style={{ fontFamily: mono, fontSize: 15, letterSpacing: "0.14em", color: C.dim }}>{step}</div>
    </div>
    <div style={{ fontFamily: display, fontSize: 31, fontWeight: 500, marginTop: 18, letterSpacing: "-0.01em" }}>{title}</div>
  </div>
);

const Slider: React.FC<{ value: number }> = ({ value }) => (
  <div style={{ position: "relative", height: 8, borderRadius: 8, background: "rgba(120,150,210,0.18)", marginTop: 18 }}>
    <div style={{ width: `${value * 100}%`, height: "100%", borderRadius: 8, background: GRADIENT }} />
    <div
      style={{
        position: "absolute",
        top: -9,
        left: `calc(${value * 100}% - 13px)`,
        width: 26,
        height: 26,
        borderRadius: 26,
        background: "#fff",
        boxShadow: `0 0 0 5px rgba(65,105,225,0.35), 0 6px 14px rgba(0,0,0,0.5)`,
      }}
    />
  </div>
);

const ScreenSimulacao: React.FC = () => {
  const frame = useCurrentFrame();
  const v = interpolate(frame, [56, 108], [0, 1], { ...CLAMP, easing: (t) => 1 - (1 - t) ** 3 });
  const prazo = interpolate(frame, [104, 136], [0.2, 0.5], { ...CLAMP, easing: (t) => 1 - (1 - t) ** 3 });
  const shimmer = ((frame * 5) % 260) - 60;
  return (
    <>
      <ScreenHeader step="ETAPA 1 DE 3" title="Simule seu crédito" />
      <div style={{ padding: "22px 30px 0" }}>
        <div style={{ fontSize: 18, color: C.muted }}>De quanto sua empresa precisa?</div>
        <div style={{ fontFamily: display, fontSize: 58, fontWeight: 500, letterSpacing: "-0.02em", marginTop: 4 }}>
          {brl(lerp(5000, 15000, v))}
        </div>
        <Slider value={lerp(0.09, 0.29, v)} />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, color: C.dim, marginTop: 12 }}>
          <span>R$ 500</span>
          <span>R$ 50.000</span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 26 }}>
          <div style={{ fontSize: 18, color: C.muted }}>Prazo</div>
          <div style={{ fontFamily: display, fontSize: 24, fontWeight: 500 }}>{Math.round(lerp(6, 12, (prazo - 0.2) / 0.3))} meses</div>
        </div>
        <Slider value={prazo} />

        <div style={{ marginTop: 30, padding: 20, borderRadius: 20, background: "rgba(65,105,225,0.10)", border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 17, color: C.muted }}>Parcela estimada</div>
          <div style={{ position: "relative", height: 34, width: 200, borderRadius: 10, marginTop: 10, overflow: "hidden", background: "rgba(140,170,230,0.20)" }}>
            <div style={{ position: "absolute", top: 0, bottom: 0, left: shimmer, width: 70, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.28), transparent)" }} />
          </div>
          <div style={{ fontSize: 15, lineHeight: 1.4, color: C.dim, marginTop: 12 }}>
            Veja parcela, prazo e taxa antes de qualquer compromisso.
          </div>
        </div>
        <div style={{ marginTop: 22, padding: "17px 0", borderRadius: 999, textAlign: "center", background: C.royal, fontSize: 20, fontWeight: 600 }}>
          Continuar
        </div>
      </div>
    </>
  );
};

const DOCS = [
  { title: "Documentos da empresa", at: 162 },
  { title: "Documento do responsável", at: 180 },
  { title: "Comprovantes", at: 198 },
];

const ScreenDocumentos: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      <ScreenHeader step="ETAPA 2 DE 3" title="Envie os documentos" />
      <div style={{ padding: "18px 30px 0" }}>
        <div style={{ fontSize: 18, color: C.muted, lineHeight: 1.4 }}>Tudo digital, direto pelo celular.</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 24 }}>
          {DOCS.map((doc) => {
            const p = interpolate(frame, [doc.at, doc.at + 24], [0, 1], CLAMP);
            return (
              <div key={doc.title} style={{ padding: "18px 18px", borderRadius: 18, background: "rgba(14,22,42,0.9)", border: `1px solid ${C.border}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <Icon name="doc" size={30} color={C.cyan} />
                  <div style={{ flex: 1, fontSize: 19, fontWeight: 500 }}>{doc.title}</div>
                  {p >= 1 ? <Icon name="check" size={26} color={C.cyan} stroke={2.4} /> : null}
                </div>
                <div style={{ height: 5, borderRadius: 5, background: "rgba(120,150,210,0.16)", marginTop: 14, overflow: "hidden" }}>
                  <div style={{ width: `${p * 100}%`, height: "100%", background: GRADIENT }} />
                </div>
                <div style={{ fontFamily: mono, fontSize: 13, letterSpacing: "0.08em", color: C.dim, marginTop: 10 }}>
                  {p >= 1 ? "ENVIADO" : p > 0 ? "ENVIANDO…" : "AGUARDANDO"}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 26, padding: "17px 0", borderRadius: 999, textAlign: "center", background: C.royal, fontSize: 20, fontWeight: 600 }}>
          Enviar documentos
        </div>
        <div style={{ fontSize: 15, color: C.dim, textAlign: "center", marginTop: 14 }}>Sem filas e sem deslocamentos.</div>
      </div>
    </>
  );
};

const STEPS = [
  { title: "Solicitação enviada", state: "done" },
  { title: "Documentos recebidos", state: "done" },
  { title: "Análise interna", state: "now" },
  { title: "Proposta", state: "next" },
];

const ScreenEtapas: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      <ScreenHeader step="ETAPA 3 DE 3" title="Acompanhe cada etapa" />
      <div style={{ padding: "26px 30px 0" }}>
        {STEPS.map((step, i) => {
          const a = ramp(frame, 232 + i * 10, 22);
          const now = step.state === "now";
          const next = step.state === "next";
          return (
            <div key={step.title} style={{ display: "flex", gap: 18, opacity: a * (next ? 0.5 : 1), transform: `translateX(${(1 - a) * 24}px)` }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 38,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: next ? "transparent" : now ? "rgba(56,198,244,0.16)" : C.royal,
                    border: `2px solid ${next ? C.dim : now ? C.cyan : C.royal}`,
                    boxShadow: now ? `0 0 ${14 + 8 * Math.sin(frame / 6)}px ${C.cyan}` : undefined,
                  }}
                >
                  {step.state === "done" && <Icon name="check" size={22} color="#fff" stroke={2.6} />}
                  {now && <div style={{ width: 12, height: 12, borderRadius: 12, background: C.cyan }} />}
                </div>
                {i < STEPS.length - 1 && <div style={{ width: 2, height: 62, background: next || now ? C.border : C.royal }} />}
              </div>
              <div style={{ paddingTop: 3 }}>
                <div style={{ fontSize: 22, fontWeight: 500 }}>{step.title}</div>
                <div style={{ fontSize: 16, color: now ? C.cyan : C.dim, marginTop: 4 }}>
                  {now ? "Em andamento" : next ? "Após a análise" : "Concluído"}
                </div>
              </div>
            </div>
          );
        })}
        <div
          style={{
            marginTop: 34,
            padding: 20,
            borderRadius: 20,
            background: "rgba(65,105,225,0.10)",
            border: `1px solid ${C.border}`,
            opacity: ramp(frame, 276, 24),
            fontSize: 17,
            lineHeight: 1.45,
            color: C.muted,
          }}
        >
          Acompanhe sua solicitação pelo celular, sem sair da sua empresa.
        </div>
      </div>
    </>
  );
};

const Screen: React.FC<{ from: number; to?: number; children: React.ReactNode }> = ({ from, to, children }) => {
  const frame = useCurrentFrame();
  const a = from === 0 ? 1 : ramp(frame, from, 16);
  const b = to === undefined ? 0 : ramp(frame, to, 16);
  if (a === 0 || b === 1) return null;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: a * (1 - b), transform: `translateX(${(1 - a) * 90 - b * 90}px)` }}>
      {children}
    </div>
  );
};

const HEADLINES = [
  { text: "100% online.", at: 22, accent: true },
  { text: "Simples e digital.", at: 150 },
  { text: "Sem deslocamentos.", at: 272 },
];
const TRACK = [
  { label: "Simule", from: 0 },
  { label: "Envie", from: 148 },
  { label: "Acompanhe", from: 222 },
];

export const Online: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const enter = ramp(frame, 4, 40);
  const active = TRACK.filter((t) => frame >= t.from).length - 1;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 130, top: 232, width: 860 }}>
        <Eyebrow at={10}>Contratação digital</Eyebrow>
        <div style={{ marginTop: 34, display: "flex", flexDirection: "column", gap: 22 }}>
          {HEADLINES.map((h) => (
            <Words
              key={h.text}
              text={h.text}
              at={h.at}
              stagger={4}
              accent={h.accent ? ["100%", "online"] : []}
              style={{ fontSize: h.accent ? 150 : 84, fontWeight: h.accent ? 600 : 500, color: h.accent ? C.text : "#c9d6f5" }}
            />
          ))}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 1090,
          top: 110,
          opacity: enter,
          transform: `translateY(${(1 - enter) * 140 + Math.sin(frame / 40) * 8}px)`,
        }}
      >
        <Phone rotateY={lerp(-36, -15, enter) + Math.sin(frame / 55) * 2.5} rotateX={5}>
          <Screen from={0} to={146}>
            <ScreenSimulacao />
          </Screen>
          <Screen from={148} to={220}>
            <ScreenDocumentos />
          </Screen>
          <Screen from={222}>
            <ScreenEtapas />
          </Screen>
        </Phone>
      </div>

      {/* trilha de etapas ao lado do celular */}
      <div style={{ position: "absolute", left: 1590, top: 400, display: "flex", flexDirection: "column", gap: 26 }}>
        {TRACK.map((t, i) => {
          const a = ramp(frame, 40 + i * 8, 24);
          const on = i === active;
          return (
            <div key={t.label} style={{ display: "flex", alignItems: "center", gap: 16, opacity: a * (on ? 1 : 0.42) }}>
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 46,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: mono,
                  fontSize: 20,
                  color: on ? "#fff" : C.muted,
                  background: on ? C.royal : "transparent",
                  border: `1.5px solid ${on ? C.royal : C.border}`,
                  boxShadow: on ? `0 0 26px rgba(65,105,225,0.7)` : undefined,
                }}
              >
                {i + 1}
              </div>
              <div style={{ fontFamily: display, fontSize: 32, fontWeight: 500, color: C.text }}>{t.label}</div>
            </div>
          );
        })}
      </div>

      <Rise at={60} style={{ position: "absolute", left: 130, bottom: 84 }}>
        <div style={{ fontFamily: body, fontSize: 24, color: C.dim }}>Interface e valores ilustrativos. {AVISO}</div>
      </Rise>
    </AbsoluteFill>
  );
};

// ====================================================================
// CENA 06 — PARA QUEM É A NEXUS
// ====================================================================
const SEGMENTS = [
  { icon: "store", title: "Comércio", sub: "Lojas e varejo", at: 24 },
  { icon: "briefcase", title: "Serviços", sub: "Prestadores de serviços", at: 58 },
  { icon: "user", title: "MEI", sub: "Microempreendedores", at: 92 },
  { icon: "building", title: "Pequenas empresas", sub: "De todos os segmentos", at: 116 },
  { icon: "growth", title: "Em expansão", sub: "Negócios em crescimento", at: 134 },
];

export const Publico: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 150, textAlign: "center" }}>
        <Eyebrow at={8} center>
          Para quem é a Nexus
        </Eyebrow>
        <Words text="Crédito para quem empreende." at={14} stagger={4} style={{ fontSize: 76, marginTop: 26 }} />
      </div>

      <div style={{ position: "absolute", left: 120, right: 120, top: 400, display: "flex", gap: 28, perspective: 1800 }}>
        {SEGMENTS.map((s, i) => {
          const a = ramp(frame, s.at, 32);
          const bob = Math.sin(frame / 36 + i * 1.3) * 7;
          return (
            <Glass
              key={s.title}
              style={{
                flex: 1,
                height: 330,
                padding: 30,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                opacity: a,
                transform: `translateY(${(1 - a) * 90 + bob}px) rotateX(${(1 - a) * 28}deg) rotateY(${(i - 2) * -3}deg)`,
                filter: a < 1 ? `blur(${(1 - a) * 8}px)` : undefined,
              }}
            >
              <IconTile name={s.icon} size={84} />
              <div>
                <div style={{ fontFamily: display, fontSize: 36, fontWeight: 500, letterSpacing: "-0.015em", lineHeight: 1.1 }}>{s.title}</div>
                <div style={{ fontSize: 22, color: C.muted, marginTop: 10 }}>{s.sub}</div>
              </div>
            </Glass>
          );
        })}
      </div>

      <div style={{ position: "absolute", left: 0, right: 0, top: 812, textAlign: "center" }}>
        <Words
          text="Exclusivo para empresas com CNPJ ativo."
          at={184}
          stagger={4}
          accent={["CNPJ", "ativo"]}
          style={{ fontSize: 80 }}
        />
      </div>
    </AbsoluteFill>
  );
};

// ====================================================================
// CENA 07 — ENCERRAMENTO E CONVERSÃO
// ====================================================================
export const Encerramento: React.FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const cta = ramp(frame, 184, 30);
  const pulse = 0.5 + 0.5 * Math.sin((frame - 184) / 9);
  return (
    <AbsoluteFill>
      <LightLine at={0} out={30} y={300} width={1300} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 44, display: "flex", justifyContent: "center" }}>
        <LogoReveal at={8} size={500} />
      </div>

      <div style={{ position: "absolute", left: 0, right: 0, top: 520, textAlign: "center" }}>
        <Words text="Seu negócio merece avançar." at={102} stagger={5} accent={["avançar"]} style={{ fontSize: 96 }} />
      </div>

      <div style={{ position: "absolute", left: 0, right: 0, top: 690, display: "flex", justifyContent: "center", gap: 28 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: "24px 44px",
            borderRadius: 999,
            background: C.royal,
            color: "#fff",
            fontFamily: body,
            fontSize: 34,
            fontWeight: 600,
            opacity: cta,
            transform: `translateY(${(1 - cta) * 30}px) scale(${lerp(0.94, 1, cta)})`,
            boxShadow: `0 0 ${36 + pulse * 30}px rgba(65,105,225,${0.5 + pulse * 0.25}), inset 0 1px 0 rgba(255,255,255,0.3)`,
          }}
        >
          Faça sua simulação
          <Icon name="arrow" size={34} color="#fff" stroke={2.2} />
        </div>
        <Rise at={196}>
          <div
            style={{
              padding: "24px 44px",
              borderRadius: 999,
              border: `1.5px solid ${C.borderStrong}`,
              color: C.text,
              fontFamily: body,
              fontSize: 34,
              fontWeight: 500,
            }}
          >
            Conheça nossas soluções
          </div>
        </Rise>
      </div>

      <Rise at={214} style={{ position: "absolute", left: 0, right: 0, top: 836, textAlign: "center" }}>
        <div style={{ fontFamily: display, fontSize: 46, fontWeight: 500, letterSpacing: "0.01em", color: C.text }}>{SITE}</div>
      </Rise>

      <Rise at={236} y={16} style={{ position: "absolute", left: 0, right: 0, bottom: 58, textAlign: "center" }}>
        <div style={{ fontFamily: body, fontSize: 20, color: C.dim, lineHeight: 1.6 }}>
          {AVISO}
          <br />
          {LEGAL}
        </div>
      </Rise>
    </AbsoluteFill>
  );
};
