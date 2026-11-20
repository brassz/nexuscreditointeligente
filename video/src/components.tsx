import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  Sequence,
  interpolate,
  random,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { C, GRADIENT } from "./theme";
import { body, display, mono } from "./fonts";

// ---------- animação ----------

export const EASE = Easing.bezier(0.16, 1, 0.3, 1);
const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Vai de 0 a 1 a partir do frame `start`, em `dur` frames, com desaceleração suave. */
export const ramp = (frame: number, start: number, dur = 26, easing = EASE) =>
  interpolate(frame, [start, start + dur], [0, 1], { ...CLAMP, easing });

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Entra subindo e desfocado; opcionalmente sai no frame `out`. */
export const Rise: React.FC<{
  at: number;
  out?: number;
  y?: number;
  dur?: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ at, out, y = 36, dur = 26, style, children }) => {
  const frame = useCurrentFrame();
  const a = ramp(frame, at, dur);
  const b = out === undefined ? 0 : ramp(frame, out, 14, Easing.in(Easing.cubic));
  return (
    <div
      style={{
        opacity: a * (1 - b),
        transform: `translateY(${(1 - a) * y - b * 24}px)`,
        filter: a < 1 || b > 0 ? `blur(${(1 - a) * 10 + b * 8}px)` : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Tipografia cinética: as palavras entram uma a uma. Palavras em `accent` ficam no degradê da marca. */
export const Words: React.FC<{
  text: string;
  at: number;
  out?: number;
  stagger?: number;
  accent?: string[];
  style?: React.CSSProperties;
}> = ({ text, at, out, stagger = 3, accent = [], style }) => {
  const frame = useCurrentFrame();
  const b = out === undefined ? 0 : ramp(frame, out, 14, Easing.in(Easing.cubic));
  return (
    <div
      style={{
        fontFamily: display,
        fontWeight: 500,
        letterSpacing: "-0.02em",
        lineHeight: 1.06,
        color: C.text,
        opacity: 1 - b,
        transform: `translateY(${-b * 24}px)`,
        filter: b > 0 ? `blur(${b * 8}px)` : undefined,
        ...style,
      }}
    >
      {text.split("\n").map((line, l, lines) => {
        const before = lines.slice(0, l).join(" ").split(" ").filter(Boolean).length;
        return (
          <div key={l}>
            {line.split(" ").map((word, i) => {
              const a = ramp(frame, at + (before + i) * stagger, 22);
              const clean = word.replace(/[.,?!:]/g, "");
              const hot = accent.includes(clean);
              return (
                <span
                  key={i}
                  style={{
                    display: "inline-block",
                    marginRight: "0.26em",
                    opacity: a,
                    transform: `translateY(${(1 - a) * 0.5}em)`,
                    filter: a < 1 ? `blur(${(1 - a) * 10}px)` : undefined,
                    ...(hot
                      ? {
                          backgroundImage: GRADIENT,
                          WebkitBackgroundClip: "text",
                          backgroundClip: "text",
                          color: "transparent",
                        }
                      : {}),
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

export const Eyebrow: React.FC<{ at: number; children: string; center?: boolean }> = ({
  at,
  children,
  center,
}) => {
  const frame = useCurrentFrame();
  const a = ramp(frame, at, 24);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: center ? "center" : "flex-start",
        gap: 16,
        opacity: a,
        fontFamily: mono,
        fontSize: 22,
        letterSpacing: "0.22em",
        color: C.cyan,
        textTransform: "uppercase",
      }}
    >
      <div style={{ width: 44 * a, height: 2, background: GRADIENT, borderRadius: 2 }} />
      {children}
    </div>
  );
};

// ---------- fundo contínuo (fica atrás de todas as cenas) ----------

const PARTICLES = Array.from({ length: 22 }, (_, i) => ({
  x: random(`px${i}`) * 1920,
  y: random(`py${i}`) * 1080,
  r: 1 + random(`pr${i}`) * 1.8,
  speed: 0.12 + random(`ps${i}`) * 0.25,
  phase: random(`pp${i}`) * 6.28,
}));

export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(1300px 820px at ${50 + Math.sin(t * 0.11) * 14}% ${34 + Math.cos(t * 0.09) * 8}%, rgba(31, 84, 200, 0.30), transparent 70%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(900px 640px at ${80 + Math.cos(t * 0.08) * 8}% ${88 + Math.sin(t * 0.1) * 5}%, rgba(56, 198, 244, 0.11), transparent 70%)`,
        }}
      />
      {/* piso em perspectiva: malha discreta que dá profundidade */}
      <div
        style={{
          position: "absolute",
          left: -600,
          right: -600,
          bottom: -260,
          height: 900,
          transform: "perspective(900px) rotateX(64deg)",
          transformOrigin: "50% 100%",
          backgroundImage: `linear-gradient(rgba(110,150,230,0.16) 1px, transparent 1px), linear-gradient(90deg, rgba(110,150,230,0.16) 1px, transparent 1px)`,
          backgroundSize: "96px 96px",
          backgroundPosition: `0px ${(frame * 0.6) % 96}px`,
          WebkitMaskImage: "linear-gradient(to top, rgba(0,0,0,0.55), transparent 78%)",
          maskImage: "linear-gradient(to top, rgba(0,0,0,0.55), transparent 78%)",
        }}
      />
      {PARTICLES.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: p.x + Math.sin(t * 0.3 + p.phase) * 18,
            top: (((p.y - frame * p.speed) % 1080) + 1080) % 1080,
            width: p.r * 2,
            height: p.r * 2,
            borderRadius: "50%",
            background: C.cyan,
            opacity: 0.16 + 0.14 * Math.sin(t * 0.8 + p.phase),
          }}
        />
      ))}
      <AbsoluteFill
        style={{ background: "radial-gradient(ellipse at center, transparent 52%, rgba(0,0,0,0.72) 100%)" }}
      />
    </AbsoluteFill>
  );
};

// ---------- peças de interface ----------

export const Glass: React.FC<{ style?: React.CSSProperties; children?: React.ReactNode }> = ({
  style,
  children,
}) => (
  <div
    style={{
      background: `linear-gradient(160deg, rgba(30, 44, 76, 0.78), rgba(10, 16, 30, 0.86))`,
      border: `1px solid ${C.border}`,
      borderRadius: 28,
      boxShadow:
        "0 50px 90px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.02), inset 0 1px 0 rgba(255,255,255,0.10)",
      fontFamily: body,
      color: C.text,
      ...style,
    }}
  >
    {children}
  </div>
);

const ICONS: Record<string, string[]> = {
  store: ["M3 9l1.5-5h15L21 9", "M4.5 11v9h15v-9", "M9.5 20v-5h5v5", "M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"],
  briefcase: ["M5 7h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z", "M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2", "M3 13h18"],
  building: ["M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16", "M3 21h18", "M9 7.5h2M13 7.5h2M9 11.5h2M13 11.5h2M9 15.5h2M13 15.5h2"],
  user: ["M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z", "M4 21a8 8 0 0 1 16 0"],
  growth: ["M3 17l6-6 4 4 8-8", "M15 7h6v6"],
  truck: ["M2 6h11v10H2z", "M13 9h4l4 4v3h-8", "M6.5 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4z", "M17.5 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"],
  box: ["M21 8l-9-5-9 5v8l9 5 9-5V8z", "M3 8l9 5 9-5", "M12 13v8"],
  bolt: ["M13 3L5 13.5h6L10 21l8-10.5h-6L13 3z"],
  doc: ["M7 3h7l5 5v13H7z", "M14 3v5h5", "M10 13h6M10 17h6"],
  check: ["M5 12.5l4.5 4.5L19 7.5"],
  shield: ["M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z", "M8.5 12l2.5 2.5 4.5-5"],
  chart: ["M4 20V11M10 20V5M16 20v-7M2 20h20"],
  ban: ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z", "M5.6 5.6l12.8 12.8"],
  activity: ["M3 12h4l3-8 4 16 3-8h4"],
  clock: ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z", "M12 7v5l3 2"],
  coin: ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z", "M14.6 9.6c-.5-1-1.5-1.6-2.6-1.6-1.5 0-2.6.8-2.6 2s1 1.7 2.6 2 2.6.8 2.6 2-1.1 2-2.6 2c-1.2 0-2.2-.6-2.7-1.6M12 6.4V8M12 16v1.6"],
  arrow: ["M5 12h14", "M13 6l6 6-6 6"],
};

export const Icon: React.FC<{ name: keyof typeof ICONS | string; size?: number; color?: string; stroke?: number }> = ({
  name,
  size = 32,
  color = C.cyan,
  stroke = 1.7,
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    {ICONS[name].map((d, i) => (
      <path key={i} d={d} />
    ))}
  </svg>
);

/** Quadrado com ícone, usado em cartões. */
export const IconTile: React.FC<{ name: string; size?: number; color?: string }> = ({
  name,
  size = 64,
  color = C.cyan,
}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size * 0.28,
      flexShrink: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "rgba(56, 198, 244, 0.10)",
      border: `1px solid rgba(56, 198, 244, 0.28)`,
    }}
  >
    <Icon name={name} size={size * 0.5} color={color} />
  </div>
);

/** Logotipo oficial (PNG). `variant="full"` inclui o nome; `"mark"` é só o símbolo. */
export const Logo: React.FC<{ variant?: "full" | "mark"; size: number; style?: React.CSSProperties }> = ({
  variant = "full",
  size,
  style,
}) => (
  <Img
    src={staticFile(variant === "full" ? "nexus-logo-full.png" : "nexus-mark.png")}
    style={{ width: size, height: "auto", display: "block", ...style }}
  />
);

/**
 * Entrada premium do logotipo completo: o símbolo surge do desfoque, o nome é
 * revelado da esquerda para a direita e um reflexo de luz atravessa a marca.
 */
export const LogoReveal: React.FC<{ at: number; size: number }> = ({ at, size }) => {
  const frame = useCurrentFrame();
  const mark = ramp(frame, at, 34);
  const name = ramp(frame, at + 26, 34);
  const sweep = interpolate(frame, [at + 44, at + 92], [130, -30], CLAMP);
  const glow = ramp(frame, at, 30) * (0.75 + 0.25 * Math.sin((frame - at) / 22));
  const src = staticFile("nexus-logo-full.png");
  const fill: React.CSSProperties = { position: "absolute", inset: 0, width: size, height: size };
  // No PNG (quadrado), o símbolo ocupa os 58% de cima e o nome os 42% de baixo.
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "32%",
          width: size * 1.7,
          height: size * 1.2,
          transform: "translate(-50%, -50%)",
          background: `radial-gradient(closest-side, rgba(56,198,244,${0.26 * glow}), rgba(65,105,225,${0.12 * glow}) 55%, transparent 100%)`,
        }}
      />
      <Img
        src={src}
        style={{
          ...fill,
          clipPath: "inset(0 0 42% 0)",
          opacity: mark,
          transform: `scale(${lerp(1.14, 1, mark)})`,
          transformOrigin: "50% 32%",
          filter: `blur(${(1 - mark) * 22}px) brightness(${1 + (1 - mark) * 0.8})`,
        }}
      />
      <Img
        src={src}
        style={{
          ...fill,
          clipPath: `inset(58% ${(1 - name) * 100}% 0 0)`,
          opacity: Math.min(1, name * 3),
        }}
      />
      <Img
        src={src}
        style={{
          ...fill,
          opacity: mark,
          filter: "brightness(2.2) saturate(0.6)",
          WebkitMaskImage: "linear-gradient(105deg, transparent 42%, #000 50%, transparent 58%)",
          maskImage: "linear-gradient(105deg, transparent 42%, #000 50%, transparent 58%)",
          WebkitMaskSize: "300% 100%",
          maskSize: "300% 100%",
          WebkitMaskPosition: `${sweep}% 0`,
          maskPosition: `${sweep}% 0`,
        }}
      />
    </div>
  );
};

/** Linha de luz horizontal: o fio condutor visual do vídeo. */
export const LightLine: React.FC<{ at: number; out: number; y: number; width?: number }> = ({
  at,
  out,
  y,
  width = 1100,
}) => {
  const frame = useCurrentFrame();
  const a = ramp(frame, at, 34);
  const b = ramp(frame, out, 22);
  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: y,
        width: width * a * (1 - b * 0.4),
        height: 2,
        transform: "translateX(-50%)",
        opacity: Math.min(1, a * 2) * (1 - b),
        background: `linear-gradient(90deg, transparent, ${C.cyan} 30%, #ffffff 50%, ${C.royal} 70%, transparent)`,
        boxShadow: `0 0 24px 2px rgba(56,198,244,0.7), 0 0 80px 10px rgba(65,105,225,0.45)`,
        borderRadius: 2,
      }}
    />
  );
};

/** Celular ilustrativo em perspectiva. O conteúdo da tela vem em `children`. */
export const Phone: React.FC<{ rotateY: number; rotateX?: number; children: React.ReactNode }> = ({
  rotateY,
  rotateX = 5,
  children,
}) => (
  <div style={{ perspective: 2200 }}>
    <div
      style={{
        width: 420,
        height: 860,
        borderRadius: 62,
        padding: 12,
        transform: `rotateY(${rotateY}deg) rotateX(${rotateX}deg)`,
        background: "linear-gradient(145deg, #3a4763 0%, #0a0f1c 38%, #1b2540 100%)",
        boxShadow: `${-rotateY * 3}px 70px 120px rgba(0,0,0,0.65), 0 0 90px rgba(65,105,225,0.28), inset 0 0 0 1.5px rgba(160,190,255,0.28)`,
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          borderRadius: 50,
          overflow: "hidden",
          background: "linear-gradient(180deg, #0b1222 0%, #05080f 100%)",
          fontFamily: body,
          color: C.text,
        }}
      >
        {children}
        <div
          style={{
            position: "absolute",
            top: 14,
            left: "50%",
            width: 110,
            height: 30,
            marginLeft: -55,
            borderRadius: 16,
            background: "#000",
          }}
        />
        {/* reflexo do vidro */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(115deg, rgba(255,255,255,0.09) 0%, transparent 32%)",
          }}
        />
      </div>
    </div>
  </div>
);

// ---------- cena e som ----------

/** Envolve cada cena: entra e sai com fusão, leve zoom e desfoque (transição cinematográfica). */
export const SceneShell: React.FC<{
  dur: number;
  transition: number;
  first?: boolean;
  last?: boolean;
  children: React.ReactNode;
}> = ({ dur, transition, first, last, children }) => {
  const frame = useCurrentFrame();
  const a = first ? ramp(frame, 0, 24) : ramp(frame, 0, transition, Easing.out(Easing.cubic));
  const b = last
    ? ramp(frame, dur - 26, 24, Easing.inOut(Easing.cubic))
    : ramp(frame, dur - transition, transition, Easing.in(Easing.cubic));
  const drift = interpolate(frame, [0, dur], [1, 1.035]); // aproximação lenta e contínua
  return (
    <AbsoluteFill
      style={{
        opacity: a * (1 - b),
        transform: `scale(${(lerp(0.955, 1, a) + (last ? 0 : b * 0.07)) * drift})`,
        filter: a < 1 || (b > 0 && !last) ? `blur(${(1 - a) * 14 + (last ? 0 : b * 14)}px)` : undefined,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/** Efeito sonoro: [arquivo em public/sfx, frame dentro da cena, volume, tom]. */
export type Cue = [name: string, at: number, volume: number, rate?: number];

export const Cues: React.FC<{ list: Cue[]; gain: number }> = ({ list, gain }) => (
  <>
    {list.map(([name, at, volume, rate = 1], i) => (
      <Sequence key={i} from={Math.max(0, Math.round(at))} layout="none">
        <Audio src={staticFile(`sfx/${name}.wav`)} volume={volume * gain} playbackRate={rate} />
      </Sequence>
    ))}
  </>
);
