import { interpolate, spring, useVideoConfig } from "remotion";
import { fonts } from "../fonts";
import { theme } from "../theme";
import { SectionScene } from "./SectionScene";
import { SplitReveal } from "./SplitReveal";

export const CONTENT_SECTIONS = 8;

type Props = {
  sectionHeight: number;
  viewportHeight: number;
  scrollY: number;
  frame: number;
  introHold: number;
};

const Eye: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p
    style={{
      fontFamily: fonts.body,
      fontSize: 13,
      fontWeight: 700,
      letterSpacing: "0.14em",
      textTransform: "uppercase",
      color: theme.neon,
      marginBottom: 12,
    }}
  >
    {children}
  </p>
);

const H2: React.FC<{ children: React.ReactNode; center?: boolean }> = ({
  children,
  center,
}) => (
  <h2
    style={{
      fontFamily: fonts.display,
      fontSize: 52,
      fontWeight: 700,
      lineHeight: 1.05,
      letterSpacing: "-0.03em",
      color: theme.white,
      marginBottom: 20,
      textAlign: center ? "center" : "left",
    }}
  >
    {children}
  </h2>
);

const Body: React.FC<{ children: React.ReactNode; center?: boolean }> = ({
  children,
  center,
}) => (
  <p
    style={{
      fontFamily: fonts.body,
      fontSize: 20,
      lineHeight: 1.75,
      color: theme.muted,
      textAlign: center ? "center" : "left",
    }}
  >
    {children}
  </p>
);

const Rule = () => (
  <div
    style={{
      width: 60,
      height: 2,
      marginBottom: 20,
      background: `linear-gradient(to right, ${theme.blue}, ${theme.neon})`,
    }}
  />
);

const BtnGlow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      display: "inline-block",
      padding: "16px 36px",
      borderRadius: 999,
      background: `linear-gradient(135deg, ${theme.blue}, ${theme.neon})`,
      fontFamily: fonts.display,
      fontSize: 18,
      fontWeight: 700,
      color: "#fff",
      boxShadow: "0 12px 40px rgba(0,87,255,0.35)",
    }}
  >
    {children}
  </div>
);

export const NexusLandingContent: React.FC<Props> = ({
  sectionHeight,
  viewportHeight,
  scrollY,
  frame,
  introHold,
}) => {
  const { fps } = useVideoConfig();
  const isTall = sectionHeight > 1200;

  const heroBtnScale = spring({
    frame: frame - introHold * 0.9,
    fps,
    config: { damping: 14, stiffness: 100 },
  });

  const scene = (
    index: number,
    bg: string | undefined,
    content: React.ReactNode
  ) => (
    <SectionScene
      key={index}
      index={index}
      sectionHeight={sectionHeight}
      viewportHeight={viewportHeight}
      scrollY={scrollY}
      bg={bg}
    >
      {content}
    </SectionScene>
  );

  return (
    <div style={{ width: "100%" }}>
      {scene(0, undefined, (
        <div style={{ textAlign: "center", maxWidth: 900 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: theme.neon,
              marginBottom: 32,
              opacity: interpolate(frame, [8, 20], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: theme.neon,
                boxShadow: `0 0 12px ${theme.neon}`,
              }}
            />
            Crédito empresarial · Exclusivo CNPJ
          </div>
          <SplitReveal
            lines={["Capital para", "sua empresa"]}
            fontSize={isTall ? 80 : 92}
            gradientLine={1}
          />
          <div
            style={{
              marginTop: 40,
              transform: `scale(${heroBtnScale})`,
              opacity: heroBtnScale,
            }}
          >
            <BtnGlow>Simular gratuitamente →</BtnGlow>
          </div>
        </div>
      ))}

      {scene(1, "rgba(0,87,255,0.03)", (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 64,
            width: "100%",
            maxWidth: 1100,
          }}
        >
          <div>
            <Eye>O problema</Eye>
            <Rule />
            <H2>O fornecedor cobra amanhã. O banco responde: "Em análise."</H2>
            <Body>
              Dias no vácuo. CNPJ consultado sem garantia de aprovação. Quem
              precisa de capital de giro paga o preço da burocracia.
            </Body>
          </div>
          <div>
            <Eye>A solução</Eye>
            <Rule />
            <H2>
              <span style={{ color: theme.neon }}>Resposta em minutos</span> — não
              em dias.
            </H2>
            <Body>
              Simule parcela e taxa sem consultar o CNPJ. Análise inteligente em
              segundos. Só avança quando fizer sentido para a empresa.
            </Body>
          </div>
        </div>
      ))}

      {scene(2, undefined, (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 64,
            width: "100%",
            maxWidth: 1100,
            alignItems: "center",
          }}
        >
          <div>
            <Eye>Simulador inteligente</Eye>
            <Rule />
            <H2>Veja a parcela da sua empresa antes de qualquer compromisso.</H2>
            <Body>Simulação sem consulta ao CNPJ. Exclusivo para empresas.</Body>
          </div>
          <div
            style={{
              background: theme.cardBg,
              border: `1px solid ${theme.cardBorder}`,
              borderRadius: 28,
              padding: 40,
              boxShadow: "0 0 80px rgba(0,87,255,0.12)",
            }}
          >
            <p style={{ fontSize: 12, color: theme.muted, marginBottom: 8 }}>
              QUANTO SUA EMPRESA PRECISA?
            </p>
            <p
              style={{
                fontFamily: fonts.display,
                fontSize: 56,
                fontWeight: 700,
                marginBottom: 24,
              }}
            >
              R$ <span style={{ color: theme.neon }}>15.000</span>
            </p>
            <div
              style={{
                height: 4,
                background: "rgba(255,255,255,0.1)",
                borderRadius: 2,
                marginBottom: 32,
              }}
            >
              <div
                style={{
                  width: "45%",
                  height: "100%",
                  background: `linear-gradient(90deg, ${theme.blue}, ${theme.neon})`,
                  borderRadius: 2,
                  boxShadow: `0 0 16px ${theme.neon}66`,
                }}
              />
            </div>
            <BtnGlow>Quero essa proposta →</BtnGlow>
          </div>
        </div>
      ))}

      {scene(3, "rgba(0,87,255,0.03)", (
        <div style={{ maxWidth: 800, width: "100%" }}>
          <Eye>Processo</Eye>
          <Rule />
          <H2>Do pedido ao dinheiro em 4 movimentos.</H2>
          <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 20 }}>
            {[
              ["01", "Informe o CNPJ", "Formulário rápido para empresas e MEIs."],
              ["02", "IA analisa a empresa", "Faturamento, setor e histórico em segundos."],
              ["03", "Envie só o essencial", "Documentos digitais, sem fila."],
              ["04", "Dinheiro na conta", "Liberação em até 24h."],
            ].map(([num, title, desc]) => (
              <div key={num} style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    border: `1px solid rgba(0,163,255,0.3)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: fonts.display,
                    fontWeight: 700,
                    color: theme.neon,
                    flexShrink: 0,
                    boxShadow: "0 0 20px rgba(0,163,255,0.15)",
                  }}
                >
                  {num}
                </div>
                <div>
                  <p style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 18, marginBottom: 4 }}>
                    {title}
                  </p>
                  <p style={{ fontSize: 15, color: theme.muted }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {scene(4, undefined, (
        <div style={{ width: "100%", maxWidth: 1100 }}>
          <Eye>Por que nós</Eye>
          <Rule />
          <H2>Benefícios que fazem a diferença.</H2>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 24,
              marginTop: 40,
              flexWrap: "wrap",
            }}
          >
            {[
              ["⚡", "Análise instantânea"],
              ["🔒", "100% seguro"],
              ["📊", "Taxa transparente"],
              ["💰", "Aprovação rápida"],
            ].map(([icon, title]) => (
              <div
                key={title}
                style={{
                  width: 180,
                  height: 220,
                  background: theme.cardBg,
                  border: `1px solid ${theme.cardBorder}`,
                  borderRadius: 16,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 16,
                  padding: 20,
                  boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
                }}
              >
                <span style={{ fontSize: 36 }}>{icon}</span>
                <p style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 14, textAlign: "center" }}>
                  {title}
                </p>
                <div style={{ width: 100, height: 3, background: "rgba(255,255,255,0.1)", borderRadius: 2 }}>
                  <div
                    style={{
                      width: "80%",
                      height: "100%",
                      background: `linear-gradient(90deg, ${theme.blue}, ${theme.neon})`,
                      borderRadius: 2,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {scene(5, "rgba(0,87,255,0.03)", (
        <div style={{ textAlign: "center", width: "100%" }}>
          <Eye>Resultados reais</Eye>
          <H2 center>Números que não mentem.</H2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 48,
              marginTop: 48,
              maxWidth: 900,
              margin: "48px auto 0",
            }}
          >
            {[
              ["R$ 2,8M", "liberados este mês"],
              ["+385", "clientes aprovados"],
              ["8 min", "tempo médio de análise"],
            ].map(([num, lbl]) => (
              <div key={lbl}>
                <p
                  style={{
                    fontFamily: fonts.display,
                    fontSize: 44,
                    fontWeight: 700,
                    background: `linear-gradient(135deg, ${theme.blue}, ${theme.neon})`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    marginBottom: 8,
                  }}
                >
                  {num}
                </p>
                <p style={{ fontSize: 16, color: theme.muted }}>{lbl}</p>
              </div>
            ))}
          </div>
        </div>
      ))}

      {scene(6, undefined, (
        <div style={{ width: "100%", maxWidth: 1100 }}>
          <Eye>Depoimentos</Eye>
          <Rule />
          <H2>Quem já deu o próximo passo.</H2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 20,
              marginTop: 32,
            }}
          >
            {[
              ["MR", "Marcos Ribeiro", "Autônomo · São Paulo"],
              ["CA", "Camila Alves", "Analista · Belo Horizonte"],
              ["FS", "Felipe Santos", "Empresário · Curitiba"],
            ].map(([av, name, meta]) => (
              <div
                key={name}
                style={{
                  background: theme.cardBg,
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 20,
                  padding: 24,
                }}
              >
                <p style={{ color: "#FBBF24", marginBottom: 12 }}>★★★★★</p>
                <p style={{ fontSize: 14, lineHeight: 1.7, marginBottom: 16, fontStyle: "italic" }}>
                  "Processo rápido, transparente e sem burocracia."
                </p>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background: `linear-gradient(135deg, ${theme.blue}, ${theme.neon})`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    {av}
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 14 }}>{name}</p>
                    <p style={{ fontSize: 12, color: theme.muted }}>{meta}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {scene(7, undefined, (
        <div style={{ textAlign: "center" }}>
          <SplitReveal lines={["Seu próximo passo"]} fontSize={64} />
          <Body center>Encontre a melhor proposta para você agora.</Body>
          <div style={{ marginTop: 32 }}>
            <BtnGlow>Simular gratuitamente →</BtnGlow>
          </div>
        </div>
      ))}
    </div>
  );
};
