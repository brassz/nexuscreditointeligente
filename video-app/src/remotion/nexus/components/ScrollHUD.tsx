import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { fonts } from "../fonts";
import { theme } from "../theme";
import { CONTENT_SECTIONS } from "./NexusLandingContent";

type Props = {
  scrollY: number;
  maxScroll: number;
  introHold: number;
  scrollEnd: number;
};

export const ScrollHUD: React.FC<Props> = ({
  scrollY,
  maxScroll,
  introHold,
  scrollEnd,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const hudOpacity = interpolate(
    frame,
    [introHold * 0.5, introHold, scrollEnd, durationInFrames - 15],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const pct = Math.round(
    maxScroll > 0 ? (scrollY / maxScroll) * 100 : 0
  );
  const sceneIndex = Math.min(
    CONTENT_SECTIONS - 1,
    Math.round((scrollY / Math.max(maxScroll, 1)) * (CONTENT_SECTIONS - 1))
  );

  return (
    <div
      style={{
        position: "absolute",
        right: 48,
        bottom: 48,
        zIndex: 100,
        opacity: hudOpacity,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: 12,
        fontFamily: fonts.body,
      }}
    >
      <span
        style={{
          fontSize: 11,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: theme.muted,
        }}
      >
        Scene {String(sceneIndex + 1).padStart(2, "0")}
      </span>
      <span
        style={{
          fontFamily: fonts.display,
          fontSize: 42,
          fontWeight: 700,
          color: theme.white,
          letterSpacing: "-0.04em",
          lineHeight: 1,
        }}
      >
        {pct}
        <span style={{ fontSize: 18, color: theme.neon }}>%</span>
      </span>
      <div
        style={{
          width: 120,
          height: 2,
          background: "rgba(255,255,255,0.1)",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: `linear-gradient(90deg, ${theme.blue}, ${theme.neon})`,
          }}
        />
      </div>
    </div>
  );
};
