import { AbsoluteFill, useCurrentFrame } from "remotion";

export const FilmGrain: React.FC = () => {
  const frame = useCurrentFrame();
  const seed = frame % 8;

  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        opacity: 0.055,
        mixBlendMode: "overlay",
        backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(
          `<svg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'>
            <filter id='n'>
              <feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' seed='${seed}' stitchTiles='stitch'/>
            </filter>
            <rect width='100%' height='100%' filter='url(#n)' opacity='0.55'/>
          </svg>`
        )}")`,
        backgroundSize: "180px 180px",
      }}
    />
  );
};
