import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { fonts } from "../fonts";
import { theme } from "../theme";
import { SplitReveal } from "./SplitReveal";

type OutroOverlayProps = {
  opacity: number;
  scale: number;
};

export const OutroOverlay: React.FC<OutroOverlayProps> = ({ opacity, scale }) => {
  const frame = useCurrentFrame();
  const glow = interpolate(Math.sin(frame / 12), [-1, 1], [0.4, 0.9]);
  const ringScale = interpolate(Math.sin(frame / 20), [-1, 1], [0.95, 1.08]);

  return (
    <AbsoluteFill
      style={{
        opacity,
        pointerEvents: "none",
        justifyContent: "center",
        alignItems: "center",
        background: "rgba(6,8,16,0.88)",
        backdropFilter: "blur(16px)",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(0,87,255,${glow}) 0%, transparent 70%)`,
          transform: `scale(${ringScale})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 320,
          height: 320,
          borderRadius: "50%",
          border: `1px solid ${theme.neon}33`,
          transform: `scale(${ringScale * 1.1})`,
        }}
      />
      <div
        style={{
          transform: `scale(${scale})`,
          textAlign: "center",
          padding: "0 48px",
          zIndex: 1,
        }}
      >
        <SplitReveal lines={["Seu próximo passo"]} fontSize={68} delay={0} />
        <p
          style={{
            fontFamily: fonts.body,
            fontSize: 22,
            color: theme.muted,
            maxWidth: 520,
            margin: "24px auto 40px",
            lineHeight: 1.6,
          }}
        >
          Análise gratuita para CNPJ · Simule antes de qualquer consulta
        </p>
        <div
          style={{
            display: "inline-block",
            padding: "20px 48px",
            borderRadius: 999,
            background: `linear-gradient(135deg, ${theme.blue}, ${theme.neon})`,
            fontFamily: fonts.display,
            fontSize: 22,
            fontWeight: 700,
            color: "#fff",
            boxShadow: "0 16px 48px rgba(0,87,255,0.45)",
          }}
        >
          Simular gratuitamente →
        </div>
        <Img
          src={staticFile("nexus-logo.png")}
          style={{
            marginTop: 32,
            width: 120,
            height: "auto",
            marginLeft: "auto",
            marginRight: "auto",
            filter: "drop-shadow(0 0 16px rgba(0,212,255,0.6))",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};