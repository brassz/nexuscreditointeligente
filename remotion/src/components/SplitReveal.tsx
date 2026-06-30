import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fonts } from "../fonts";
import { theme } from "../theme";

type Props = {
  lines: string[];
  fontSize?: number;
  delay?: number;
  gradientLine?: number;
};

export const SplitReveal: React.FC<Props> = ({
  lines,
  fontSize = 88,
  delay = 0,
  gradientLine,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div style={{ textAlign: "center" }}>
      {lines.map((line, lineIndex) => {
        const words = line.split(" ");
        return (
          <div
            key={lineIndex}
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "0.22em",
              marginBottom: lineIndex < lines.length - 1 ? 8 : 0,
            }}
          >
            {words.map((word, wordIndex) => {
              const i = lineIndex * 10 + wordIndex;
              const progress = spring({
                frame: frame - delay - i * 3,
                fps,
                config: { damping: 18, stiffness: 120, mass: 0.7 },
              });
              const y = interpolate(progress, [0, 1], [48, 0]);
              const isGradient = gradientLine === lineIndex;

              return (
                <span
                  key={wordIndex}
                  style={{
                    display: "inline-block",
                    fontFamily: fonts.display,
                    fontSize,
                    fontWeight: 700,
                    lineHeight: 0.95,
                    letterSpacing: "-0.04em",
                    transform: `translateY(${y}px)`,
                    opacity: progress,
                    ...(isGradient
                      ? {
                          background: `linear-gradient(90deg, ${theme.blue}, ${theme.neon}, #fff)`,
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                        }
                      : { color: theme.white }),
                  }}
                >
                  {word}
                </span>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};
