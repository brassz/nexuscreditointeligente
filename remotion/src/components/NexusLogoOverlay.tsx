import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

type Props = {
  introHold: number;
};

export const NexusLogoOverlay: React.FC<Props> = ({ introHold }) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();

  const fadeOutStart = introHold - fps * 0.6;
  const opacity = interpolate(
    frame,
    [0, fps * 0.4, fadeOutStart, introHold],
    [0, 1, 1, 0],
    { extrapolateRight: "clamp" }
  );

  const scale = spring({
    frame: Math.max(0, frame - fps * 0.1),
    fps,
    config: { damping: 200 },
    from: 0.82,
    to: 1,
  });

  const glow = interpolate(frame, [0, introHold], [8, 28], {
    extrapolateRight: "clamp",
  });

  const logoSize = Math.min(width * 0.28, 360);

  if (frame > introHold) {
    return null;
  }

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        pointerEvents: "none",
        zIndex: 60,
      }}
    >
      <Img
        src={staticFile("nexus-logo.png")}
        style={{
          width: logoSize,
          height: "auto",
          opacity,
          transform: `scale(${scale})`,
          filter: `drop-shadow(0 0 ${glow}px rgba(0, 212, 255, 0.75))`,
        }}
      />
    </AbsoluteFill>
  );
};
