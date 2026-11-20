// LINHA DO TEMPO E SOM.
// A duração de cada cena vem de src/narration.json (gerado por `npm run voz`).
import React from "react";
import { AbsoluteFill, Audio, Composition, Sequence, interpolate, staticFile } from "remotion";
import { Background, Cues, SceneShell, type Cue } from "./components";
import { Abertura, Diferencial, Encerramento, Online, Problema, Publico, Solucao } from "./scenes";
import narration from "./narration.json";

// ---------- VOLUMES (0 = mudo, 1 = volume original do arquivo) ----------
/** Narração. */
const VOLUME_VOZ = 1;
/** Trilha quando ninguém está falando. */
const VOLUME_TRILHA = 0.42;
/** Trilha enquanto o locutor fala (fica ~13 dB abaixo da voz). */
const VOLUME_TRILHA_SOB_VOZ = 0.13;
/** Multiplicador geral dos efeitos sonoros. */
const VOLUME_EFEITOS = 0.5;
/** Troque para `false` para renderizar sem narração. */
const NARRACAO = true;

type SceneId = "abertura" | "problema" | "solucao" | "diferencial" | "online" | "publico" | "encerramento";

// Componente e efeitos sonoros de cada cena: [som, frame dentro da cena, volume, tom].
// Os frames acompanham os `at={...}` das animações em scenes.tsx.
const SCENES: Record<SceneId, { C: React.FC<{ dur: number }>; cues: Cue[] }> = {
  abertura: {
    C: Abertura,
    cues: [["riser", 2, 0.3], ["impact", 36, 0.75], ["zip", 62, 0.16], ["chime", 80, 0.2], ["sparkle", 112, 0.14, 0.75]],
  },
  problema: {
    C: Problema,
    cues: [["pop", 30, 0.4, 0.9], ["pop", 76, 0.4, 0.84], ["pop", 124, 0.4, 0.78], ["error", 198, 0.3], ["land", 200, 0.4, 0.8]],
  },
  solucao: {
    C: Solucao,
    cues: [["impact", 8, 0.5, 1.15], ["chime", 34, 0.2, 0.75], ["pop", 118, 0.32], ["pop", 146, 0.32, 1.12], ["pop", 226, 0.32, 1.26], ["pop", 270, 0.32, 1.5]],
  },
  diferencial: {
    C: Diferencial,
    cues: [
      ["swish", 40, 0.1], ["land", 52, 0.35],
      ["blip", 150, 0.3, 1], ["blip", 196, 0.3, 1.12], ["blip", 242, 0.3, 1.26],
      ["note", 212, 0.3, 1], ["note", 258, 0.3, 1.26], ["note", 304, 0.3, 1.5],
      ["click", 284, 0.45], ["click", 374, 0.45, 1.1], ["chime", 400, 0.12, 0.75],
    ],
  },
  online: {
    C: Online,
    cues: [
      ["swish", 6, 0.11], ["land", 20, 0.4],
      ["click", 56, 0.4], ["blip", 104, 0.28, 1.2],
      ["swoosh", 146, 0.12], ["send", 162, 0.3], ["send", 180, 0.3, 1.06], ["send", 198, 0.3, 1.12],
      ["swoosh2", 220, 0.12], ["note", 234, 0.3, 1], ["note", 244, 0.3, 1.26], ["note", 254, 0.3, 1.5],
      ["chime", 274, 0.14],
    ],
  },
  publico: {
    C: Publico,
    cues: [
      ["pop", 24, 0.38, 0.9], ["pop", 58, 0.38, 1], ["pop", 92, 0.38, 1.12], ["pop", 116, 0.38, 1.26], ["pop", 134, 0.38, 1.5],
      ["impact", 184, 0.4, 1.2],
    ],
  },
  encerramento: {
    C: Encerramento,
    cues: [["impact", 10, 0.75], ["zip", 36, 0.14], ["chime", 54, 0.18], ["click", 184, 0.45], ["success", 214, 0.28]],
  },
};

const { fps, transition, totalFrames, scenes } = narration;

/** A trilha abaixa quando a voz entra e volta a subir nos intervalos. */
const musicVolume = (frame: number) => {
  if (!NARRACAO) return VOLUME_TRILHA;
  let duck = 0;
  for (const scene of scenes) {
    const from = scene.start + scene.voiceAt;
    const to = from + Math.ceil(scene.seconds * fps);
    duck = Math.max(
      duck,
      interpolate(frame, [from - 12, from, to, to + 18], [0, 1, 1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }),
    );
  }
  return VOLUME_TRILHA + (VOLUME_TRILHA_SOB_VOZ - VOLUME_TRILHA) * duck;
};

const Video: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Background />
    <Audio src={staticFile("musica/trilha.wav")} volume={musicVolume} />
    {scenes.map((scene, i) => {
      const { C: Scene, cues } = SCENES[scene.id as SceneId];
      const first = i === 0;
      const last = i === scenes.length - 1;
      const all: Cue[] = first ? cues : [["glide", 0, 0.4, 0.94 + (i % 3) * 0.06], ...cues];
      return (
        <Sequence key={scene.id} from={scene.start} durationInFrames={scene.frames} name={scene.id}>
          <SceneShell dur={scene.frames} transition={transition} first={first} last={last}>
            <Scene dur={scene.frames} />
          </SceneShell>
          <Cues list={all} gain={NARRACAO ? VOLUME_EFEITOS : VOLUME_EFEITOS * 1.6} />
          {NARRACAO && (
            <Sequence from={scene.voiceAt} layout="none">
              <Audio src={staticFile(`voz/${scene.id}.mp3`)} volume={VOLUME_VOZ} />
            </Sequence>
          )}
        </Sequence>
      );
    })}
  </AbsoluteFill>
);

export const Root: React.FC = () => (
  <Composition id="NexusInstitucional" component={Video} durationInFrames={totalFrames} fps={fps} width={1920} height={1080} />
);
