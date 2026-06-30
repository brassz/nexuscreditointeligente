import { interpolate } from "remotion";
import { theme } from "../theme";

type Props = {
  index: number;
  sectionHeight: number;
  viewportHeight: number;
  scrollY: number;
  bg?: string;
  children: React.ReactNode;
};

export const SectionScene: React.FC<Props> = ({
  index,
  sectionHeight,
  viewportHeight,
  scrollY,
  bg,
  children,
}) => {
  const relTop = index * sectionHeight - scrollY;
  const entryFar = viewportHeight * 0.92;
  const entryNear = viewportHeight * 0.18;
  const exitFar = -viewportHeight * 0.45;

  const inputRange = [exitFar, entryNear, entryFar];

  const translateY = interpolate(
    relTop,
    inputRange,
    [-100, 0, 160],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const opacity = interpolate(
    relTop,
    inputRange,
    [0, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const scale = interpolate(
    relTop,
    inputRange,
    [0.94, 1, 0.86],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const blur = interpolate(
    relTop,
    inputRange,
    [6, 0, 10],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <div
      style={{
        height: sectionHeight,
        position: "relative",
        background: bg ?? "transparent",
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(180deg, transparent 0%, ${theme.neon}08 50%, transparent 100%)`,
          opacity: opacity * 0.6,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 80px",
          transform: `scale(${scale}) translateY(${translateY}px)`,
          opacity,
          filter: blur > 0.4 ? `blur(${blur}px)` : undefined,
          transformOrigin: "center bottom",
          willChange: "transform, opacity, filter",
        }}
      >
        {children}
      </div>
    </div>
  );
};
