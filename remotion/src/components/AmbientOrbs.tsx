import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { theme } from "../theme";

type Props = { scrollY: number };

const ORBS = [
  { x: 15, y: 20, size: 420, color: theme.blue, speed: 0.08 },
  { x: 75, y: 55, size: 360, color: theme.neon, speed: -0.06 },
  { x: 50, y: 85, size: 280, color: "#003399", speed: 0.05 },
];

export const AmbientOrbs: React.FC<Props> = ({ scrollY }) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ overflow: "hidden", pointerEvents: "none" }}>
      {ORBS.map((orb, i) => {
        const driftX = Math.sin(frame / 40 + i) * 30;
        const driftY = Math.cos(frame / 35 + i * 2) * 24;
        const parallax = scrollY * orb.speed;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${orb.x}%`,
              top: `${orb.y}%`,
              width: orb.size,
              height: orb.size,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${orb.color}55 0%, transparent 70%)`,
              filter: "blur(60px)",
              transform: `translate(${driftX}px, ${driftY - parallax}px)`,
              opacity: 0.55,
            }}
          />
        );
      })}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% 100%, rgba(0,87,255,0.12) 0%, transparent 50%)`,
          transform: `translateY(${-scrollY * 0.03}px)`,
        }}
      />
    </AbsoluteFill>
  );
};
