// Gera a trilha sonora original por síntese (nenhum arquivo de terceiros, sem direitos autorais).
// Uso: npm run musica  →  public/musica/trilha.wav (estéreo, 44.1 kHz)
// A trilha lê src/narration.json: ela cresce cena a cena e termina junto com o vídeo.
// 100 BPM: uma batida = 18 frames, um compasso = 72 frames.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SR = 44100;
const TAU = Math.PI * 2;
const BEAT = 0.6;
const BAR = BEAT * 4;
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const narration = JSON.parse(readFileSync(join(root, "src", "narration.json"), "utf8"));
const FPS = narration.fps;
const total = narration.totalFrames / FPS;

// Intensidade de cada cena, na ordem do vídeo:
// 0 = só atmosfera · 1 = pulso de tensão · 2 = entra o ritmo · 3 = completo · 4 = resolução final
const INTENSIDADE = [0, 1, 2, 2, 3, 3, 4];

const N = Math.ceil((total + 1) * SR);
const dry = [new Float32Array(N), new Float32Array(N)];
const wet = [new Float32Array(N), new Float32Array(N)]; // vai para o reverb
const echo = [new Float32Array(N), new Float32Array(N)]; // vai para o delay

const hz = (midi) => 440 * 2 ** ((midi - 69) / 12);

/** Soma um som em `bus` a partir do tempo `t`. `fn(t)` devolve a amostra. */
const add = (bus, t, dur, fn, gain = 1, pan = 0) => {
  const i0 = Math.max(0, Math.floor(t * SR));
  const n = Math.floor(dur * SR);
  const gl = gain * Math.cos(((pan + 1) * Math.PI) / 4);
  const gr = gain * Math.sin(((pan + 1) * Math.PI) / 4);
  for (let i = 0; i < n && i0 + i < N; i++) {
    const s = fn(i / SR);
    bus[0][i0 + i] += s * gl;
    bus[1][i0 + i] += s * gr;
  }
};

// ---------- instrumentos ----------

/** Pad: camada quente e lenta que sustenta o acorde. */
const pad = (t, dur, midi, gain) => {
  const f = hz(midi);
  const attack = 0.7;
  const release = 1.4;
  for (const [detune, pan] of [[1.003, -0.7], [0.997, 0.7]]) {
    const w = TAU * f * detune;
    const fn = (x) => {
      const env = Math.min(1, x / attack) * Math.min(1, Math.max(0, (dur + release - x) / release));
      return (Math.sin(w * x) + 0.35 * Math.sin(2 * w * x + 0.5) + 0.12 * Math.sin(3 * w * x)) * env * env;
    };
    add(dry, t, dur + release, fn, gain * 0.6, pan);
    add(wet, t, dur + release, fn, gain * 0.4, pan);
  }
};

/** Pluck: nota curta e macia, usada no arpejo e no pulso. */
const pluck = (t, midi, gain, pan = 0, bright = 0.5) => {
  const w = TAU * hz(midi);
  const fn = (x) =>
    (Math.sin(w * x) + bright * Math.sin(2 * w * x) * Math.exp(-x * 9) + 0.2 * bright * Math.sin(3 * w * x) * Math.exp(-x * 14)) *
    Math.exp(-x * 5.5) * Math.min(1, x * 400);
  add(dry, t, 0.9, fn, gain, pan);
  add(echo, t, 0.9, fn, gain * 0.55, -pan);
  add(wet, t, 0.9, fn, gain * 0.3, pan);
};

/** Bell: nota brilhante para a melodia dos trechos completos. */
const bell = (t, midi, gain, pan = 0) => {
  const w = TAU * hz(midi);
  const fn = (x) =>
    (Math.sin(w * x) + 0.28 * Math.sin(2.76 * w * x) * Math.exp(-x * 6) + 0.4 * Math.sin(2 * w * x) * Math.exp(-x * 3)) *
    Math.exp(-x * 2.6) * Math.min(1, x * 300);
  add(dry, t, 1.8, fn, gain * 0.7, pan);
  add(wet, t, 1.8, fn, gain * 0.6, pan);
  add(echo, t, 1.8, fn, gain * 0.3, -pan);
};

const bass = (t, dur, midi, gain) => {
  const w = TAU * hz(midi);
  add(dry, t, dur, (x) =>
    (Math.sin(w * x) + 0.3 * Math.sin(2 * w * x) + 0.08 * Math.sin(3 * w * x)) *
    Math.min(1, x * 120) * Math.min(1, (dur - x) * 25) * Math.exp(-x * 1.2), gain);
};

const kick = (t, gain) => {
  add(dry, t, 0.4, (x) => {
    const phase = TAU * (46 * x + (95 / 28) * (1 - Math.exp(-x * 28)));
    return Math.sin(phase) * Math.exp(-x * 8.5) * Math.min(1, x * 900);
  }, gain);
};

let seed = 7;
const noise = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return (seed / 0xffffffff) * 2 - 1;
};
const hat = (t, gain, pan) => {
  let prev = 0;
  add(dry, t, 0.09, (x) => {
    const n = noise();
    const high = n - prev; // passa-alta simples
    prev = n;
    return high * Math.exp(-x * 70);
  }, gain, pan);
};

// ---------- harmonia ----------
// [baixo, notas do acorde]. Começa em tom menor (tensão) e abre para maior (solução).
const Bm = [35, [59, 62, 66]];
const G = [31, [59, 62, 67]];
const Em = [28, [59, 64, 67]];
const A = [33, [57, 61, 64]];
const D = [38, [57, 62, 66]];
const PROGRESSAO = {
  0: [Bm, G, Em, G],
  1: [Bm, G, Em, A],
  2: [D, A, Bm, G],
  3: [D, A, Bm, G],
  4: [D, G, D, D],
};
const ARPEJO = [0, 1, 2, 1, 0, 2, 1, 2]; // índices das notas do acorde, em colcheias

narration.scenes.forEach((scene, index) => {
  const level = INTENSIDADE[Math.min(index, INTENSIDADE.length - 1)];
  const t0 = scene.start / FPS;
  const last = index === narration.scenes.length - 1;
  const t1 = last ? total : narration.scenes[index + 1].start / FPS;

  for (let bar = 0, t = t0; t < t1 - 0.01; bar++, t += BAR) {
    const len = Math.min(BAR, t1 - t); // o último compasso da cena pode ser pela metade
    const beats = Math.round(len / BEAT);
    const [root, notes] = PROGRESSAO[level][bar % 4];
    const ending = last && bar >= 2; // depois do acorde final só fica a atmosfera

    for (const note of notes) pad(t, len, note, level === 0 ? 0.075 : 0.06);
    pad(t, len, root + 12, 0.07);

    if (level === 1) {
      // pulso de tensão: a mesma nota grave em colcheias
      for (let i = 0; i < beats * 2; i++) pluck(t + i * BEAT * 0.5, root + 24, i % 2 ? 0.05 : 0.08, i % 2 ? 0.3 : -0.3, 0.3);
    }

    if (level >= 2 && !ending) {
      for (let i = 0; i < beats * 2; i++) {
        const note = notes[ARPEJO[i % 8]] + (level >= 3 && i % 4 === 3 ? 12 : 0);
        pluck(t + i * BEAT * 0.5, note, level === 4 ? 0.07 : 0.09, i % 2 ? 0.45 : -0.45, 0.6);
      }
      for (let b = 0; b < beats; b++) {
        bass(t + b * BEAT, BEAT * 0.92, root + 12, b === 0 ? 0.2 : 0.14);
        const strong = b % 2 === 0;
        if (level === 2 && strong) kick(t + b * BEAT, 0.36);
        if (level === 3) kick(t + b * BEAT, strong ? 0.4 : 0.3);
        if (level === 3) hat(t + b * BEAT + BEAT * 0.5, 0.05, b % 2 ? 0.4 : -0.4);
      }
    }

    if (level === 3 && beats === 4) {
      // melodia simples: a nota mais alta do acorde, uma oitava acima
      bell(t, notes[2] + 12, 0.11, 0.2);
      bell(t + BEAT * 1.5, notes[1] + 12, 0.08, -0.2);
      if (bar % 2 === 1) bell(t + BEAT * 3, notes[2] + 14, 0.07, 0.3);
    }

    if (level === 4 && bar === 0) {
      // acorde de chegada no encerramento: grave + arpejo subindo
      kick(t, 0.45);
      bass(t, BAR, root + 12, 0.24);
      [62, 66, 69, 74, 78].forEach((note, i) => bell(t + i * 0.09, note, 0.13 - i * 0.012, (i - 2) * 0.3));
    }
    if (level === 4 && bar === 1) kick(t, 0.36);
  }
});

// ---------- efeitos ----------

/** Delay estéreo em colcheia pontuada: a esquerda alimenta a direita e vice-versa. */
{
  const d = Math.floor(BEAT * 0.75 * SR);
  const [l, r] = echo;
  for (let i = d; i < N; i++) {
    l[i] += r[i - d] * 0.42;
    r[i] += l[i - d] * 0.42;
  }
}

/** Reverb simples: quatro filtros-pente em paralelo por canal. */
const reverb = (input, delays) => {
  const out = new Float32Array(N);
  for (const delay of delays) {
    const buffer = new Float32Array(delay);
    let pos = 0;
    let damp = 0;
    for (let i = 0; i < N; i++) {
      const y = buffer[pos];
      damp = y * 0.6 + damp * 0.4; // perde agudos a cada volta
      buffer[pos] = input[i] + damp * 0.84;
      pos = (pos + 1) % delay;
      out[i] += y * 0.25;
    }
  }
  return out;
};
const room = [reverb(wet[0], [1557, 1617, 1491, 1422]), reverb(wet[1], [1583, 1651, 1523, 1447])];

// ---------- mixagem ----------
const mix = [new Float32Array(N), new Float32Array(N)];
let peak = 0;
for (let c = 0; c < 2; c++) {
  for (let i = 0; i < N; i++) {
    const t = i / SR;
    const fade = Math.min(1, t / 1.2) * Math.min(1, Math.max(0, (total - t) / 2.6));
    const s = Math.tanh((dry[c][i] + echo[c][i] * 0.5 + room[c][i] * 0.9) * 1.4) * fade;
    mix[c][i] = s;
    peak = Math.max(peak, Math.abs(s));
  }
}

const frames = Math.ceil(total * SR);
const pcm = Buffer.alloc(frames * 4);
const norm = 0.85 / peak;
for (let i = 0; i < frames; i++) {
  pcm.writeInt16LE(Math.round(mix[0][i] * norm * 32767), i * 4);
  pcm.writeInt16LE(Math.round(mix[1][i] * norm * 32767), i * 4 + 2);
}
const header = Buffer.alloc(44);
header.write("RIFF", 0);
header.writeUInt32LE(36 + pcm.length, 4);
header.write("WAVEfmt ", 8);
header.writeUInt32LE(16, 16);
header.writeUInt16LE(1, 20);
header.writeUInt16LE(2, 22);
header.writeUInt32LE(SR, 24);
header.writeUInt32LE(SR * 4, 28);
header.writeUInt16LE(4, 32);
header.writeUInt16LE(16, 34);
header.write("data", 36);
header.writeUInt32LE(pcm.length, 40);

const outDir = join(root, "public", "musica");
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "trilha.wav"), Buffer.concat([header, pcm]));
console.log(`trilha.wav: ${total.toFixed(1)}s`);
