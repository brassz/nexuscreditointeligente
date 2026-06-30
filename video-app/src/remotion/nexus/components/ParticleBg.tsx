import { AbsoluteFill } from "remotion";
import { theme } from "../theme";

const DOTS = Array.from({ length: 40 }, (_, i) => ({
  x: (i * 137) % 100,
  y: (i * 89) % 100,
  size: 1 + (i % 3),
  opacity: 0.15 + (i % 5) * 0.08,
}));

export const ParticleBg: React.FC = () => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse at 50% 0%, rgba(0,87,255,0.18) 0%, transparent 55%), ${theme.dark}`,
    }}
  >
    {DOTS.map((d, i) => (
      <div
        key={i}
        style={{
          position: "absolute",
          left: `${d.x}%`,
          top: `${d.y}%`,
          width: d.size,
          height: d.size,
          borderRadius: "50%",
          background: i % 2 ? theme.blue : theme.neon,
          opacity: d.opacity,
        }}
      />
    ))}
  </AbsoluteFill>
);
