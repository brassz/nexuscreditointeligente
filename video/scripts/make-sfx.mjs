// Gera os efeitos sonoros do vídeo por síntese (sem arquivos de terceiros).
// Uso: node scripts/make-sfx.mjs  →  public/sfx/*.wav (estéreo, 44.1 kHz)
import { mkdirSync, readdirSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SR = 44100;
const TAU = Math.PI * 2;
const outDir = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "sfx");
mkdirSync(outDir, { recursive: true });
for (const f of readdirSync(outDir)) if (f.endsWith(".wav")) unlinkSync(join(outDir, f));

// ---------- blocos básicos ----------

/** Ruído determinístico: o resultado é sempre igual. */
const makeNoise = (seed) => () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return (seed / 0xffffffff) * 2 - 1;
};

const render = (seconds, fn) => {
  const n = Math.floor(seconds * SR);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) out[i] = fn(i / n, i / SR);
  return out;
};

/** Senoide com frequência variável. `u` vai de 0 a 1, `t` é em segundos. */
const tone = (seconds, freqAt, envAt) => {
  let phase = 0;
  return render(seconds, (u, t) => {
    phase += (TAU * freqAt(u, t)) / SR;
    return Math.sin(phase) * envAt(u, t);
  });
};

/**
 * Ruído filtrado (passa-banda) com frequência variável.
 * `damp` alto = banda larga e suave ("ar"); baixo = assobio.
 */
const air = (seconds, freqAt, envAt, damp = 1.4, seed = 1) => {
  const noise = makeNoise(seed * 7919 + 13);
  let low = 0;
  let band = 0;
  return render(seconds, (u, t) => {
    const f = 2 * Math.sin((Math.PI * Math.min(freqAt(u, t), SR / 7)) / SR);
    low += f * band;
    const high = noise() - low - damp * band;
    band += f * high;
    return band * envAt(u, t);
  });
};

const mix = (...tracks) => {
  const out = new Float32Array(Math.max(...tracks.map((t) => t.length)));
  for (const t of tracks) for (let i = 0; i < t.length; i++) out[i] += t[i];
  return out;
};

/** Coloca `track` começando em `seconds`. */
const at = (seconds, track) => {
  const pad = Math.floor(seconds * SR);
  const out = new Float32Array(pad + track.length);
  out.set(track, pad);
  return out;
};

const gain = (track, g) => track.map((s) => s * g);

/** Mono → estéreo com panorâmica variável (-1 esquerda … 1 direita). */
const pan = (mono, panAt) => {
  const L = new Float32Array(mono.length);
  const R = new Float32Array(mono.length);
  for (let i = 0; i < mono.length; i++) {
    const angle = ((panAt(i / mono.length) + 1) / 2) * (Math.PI / 2);
    L[i] = mono[i] * Math.cos(angle);
    R[i] = mono[i] * Math.sin(angle);
  }
  return [L, R];
};

const toStereo = (x) => (Array.isArray(x) ? x : [x, x]);

/** Reverb simples (Schroeder) para dar "sala" aos sons tonais. */
const reverb = (input, wetMix = 0.2, feedback = 0.72, tail = 0.7) => {
  const run = (src, offset) => {
    const n = src.length + Math.floor(tail * SR);
    const out = new Float32Array(n);
    const combs = [1557, 1617, 1491, 1422].map((d) => ({
      buf: new Float32Array(d + offset),
      i: 0,
      lp: 0,
    }));
    const allpasses = [225, 556].map((d) => ({ buf: new Float32Array(d + offset), i: 0 }));
    for (let k = 0; k < n; k++) {
      const x = k < src.length ? src[k] : 0;
      let wet = 0;
      for (const c of combs) {
        const y = c.buf[c.i];
        c.lp = y * 0.55 + c.lp * 0.45;
        c.buf[c.i] = x + c.lp * feedback;
        c.i = (c.i + 1) % c.buf.length;
        wet += y;
      }
      wet *= 0.25;
      for (const a of allpasses) {
        const b = a.buf[a.i];
        const y = b - wet * 0.5;
        a.buf[a.i] = wet + b * 0.5;
        a.i = (a.i + 1) % a.buf.length;
        wet = y;
      }
      out[k] = x + wet * wetMix;
    }
    return out;
  };
  const [L, R] = toStereo(input);
  return [run(L, 0), run(R, 23)];
};

const save = (name, sound, peak = 0.85, dir = outDir) => {
  const [L, R] = toStereo(sound);
  const n = Math.max(L.length, R.length);
  let max = 0;
  for (const ch of [L, R]) for (const s of ch) max = Math.max(max, Math.abs(s));
  const g = max > 0 ? peak / max : 1;
  const fade = Math.min(n, Math.floor(0.012 * SR)); // evita estalo no fim
  const data = Buffer.alloc(n * 4);
  for (let i = 0; i < n; i++) {
    const tailGain = Math.min(1, (n - i) / fade);
    data.writeInt16LE(Math.round((L[i] ?? 0) * g * tailGain * 32767), i * 4);
    data.writeInt16LE(Math.round((R[i] ?? 0) * g * tailGain * 32767), i * 4 + 2);
  }
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + data.length, 4);
  header.write("WAVEfmt ", 8);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(2, 22); // estéreo
  header.writeUInt32LE(SR, 24);
  header.writeUInt32LE(SR * 4, 28);
  header.writeUInt16LE(4, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36);
  header.writeUInt32LE(data.length, 40);
  writeFileSync(join(dir, `${name}.wav`), Buffer.concat([header, data]));
  console.log(`${name.padEnd(34)} ${(n / SR).toFixed(2)}s`);
};

const decay = (rate) => (u, t) => Math.exp(-rate * t);
/** Ataque suave de `ms` milissegundos, para não estalar. */
const attack = (ms) => (u, t) => Math.min(1, (t * 1000) / ms);

// ---------- instrumentos ----------

/** Nota de marimba: fundamental + parcial agudo curto + batida da baqueta. */
const marimba = (freq, seconds = 0.5) =>
  mix(
    tone(seconds, () => freq, (u, t) => attack(2)(u, t) * Math.exp(-9 * t)),
    tone(seconds, () => freq * 4, (u, t) => 0.25 * Math.exp(-45 * t)),
    air(0.02, () => 3000, (u) => 0.25 * (1 - u), 1.2, 3),
  );

/** Sininho brilhante com parciais inarmônicos. */
const bell = (freq, seconds = 0.6, rate = 9) =>
  mix(
    tone(seconds, () => freq, (u, t) => attack(1)(u, t) * Math.exp(-rate * t)),
    tone(seconds, () => freq * 2.76, (u, t) => 0.45 * Math.exp(-rate * 1.6 * t)),
    tone(seconds, () => freq * 5.4, (u, t) => 0.2 * Math.exp(-rate * 2.6 * t)),
    tone(seconds, () => freq * 8.93, (u, t) => 0.08 * Math.exp(-rate * 4 * t)),
  );

// ---------- movimento (trocas de cena e entradas) ----------

// swoosh: ar grave e largo passando da esquerda para a direita
save(
  "swoosh",
  pan(
    mix(
      air(0.8, (u) => 160 + 760 * Math.sin(Math.PI * u ** 1.4) ** 2, (u) => Math.sin(Math.PI * u ** 1.5) ** 2, 1.5, 1),
      gain(air(0.8, (u) => 90 + 200 * u, (u) => Math.sin(Math.PI * u) ** 2, 1.2, 2), 0.7),
    ),
    (u) => -0.8 + 1.6 * u,
  ),
  0.6,
);

// swoosh2: parecido, mas da direita para a esquerda e um pouco mais claro
save(
  "swoosh2",
  pan(
    air(0.65, (u) => 240 + 1100 * Math.sin(Math.PI * u ** 1.2) ** 2, (u) => Math.sin(Math.PI * u ** 1.3) ** 2, 1.6, 5),
    (u) => 0.8 - 1.6 * u,
  ),
  0.55,
);

// swish: passada curta e leve, para celulares entrando
save(
  "swish",
  pan(
    air(0.32, (u) => 500 + 1500 * Math.sin(Math.PI * u) ** 2, (u) => Math.sin(Math.PI * u) ** 2, 1.5, 9),
    (u) => -0.4 + 0.8 * u,
  ),
  0.5,
);

// drop: mergulho grave e macio, outra opção de troca de cena
save(
  "drop",
  mix(
    tone(0.6, (u) => 96 - 56 * u, (u) => Math.sin(Math.PI * u) ** 1.5),
    tone(0.6, (u) => 192 - 112 * u, (u) => 0.3 * Math.sin(Math.PI * u) ** 2),
    gain(air(0.6, (u) => 500 - 350 * u, (u) => Math.sin(Math.PI * u) ** 2, 1.5, 4), 0.25),
  ),
  0.7,
);

// glide: nota deslizando para baixo — o som escolhido para as trocas de cena
// (é a amostra "troca-11-deslize-tonal")
save(
  "glide",
  reverb(tone(0.3, (u) => 1400 * Math.exp(-2.2 * u) + 180, (u) => Math.sin(Math.PI * u) ** 1.5), 0.2, 0.7, 0.4),
  0.6,
);

// land: "tum" surdo de algo pousando
save(
  "land",
  mix(
    tone(0.22, (u, t) => 55 + 70 * Math.exp(-28 * t), (u, t) => attack(2)(u, t) * Math.exp(-16 * t)),
    air(0.05, () => 700, (u) => 0.3 * (1 - u) ** 2, 1.4, 6),
  ),
);

// zip: risco rápido subindo, para setas e linhas sendo desenhadas
save(
  "zip",
  air(0.16, (u) => 700 + 3200 * u * u, (u) => Math.sin(Math.PI * Math.min(1, u * 1.15)) ** 2, 1.3, 8),
  0.5,
);

// ---------- peso ----------

// riser: tensão subindo antes do logotipo
save(
  "riser",
  mix(
    air(1.0, (u) => 200 + 2600 * u * u, (u) => u * u * (u > 0.95 ? (1 - u) / 0.05 : 1), 1.3, 10),
    tone(1.0, (u) => 180 + 420 * u * u, (u) => 0.25 * u * u * (u > 0.95 ? (1 - u) / 0.05 : 1)),
  ),
  0.6,
);

// impact: batida grave com cauda, para o logotipo
save(
  "impact",
  reverb(
    mix(
      tone(0.8, (u, t) => 40 + 100 * Math.exp(-22 * t), (u, t) => attack(2)(u, t) * Math.exp(-5 * t)),
      tone(0.5, (u, t) => 80 + 200 * Math.exp(-22 * t), (u, t) => 0.3 * Math.exp(-9 * t)),
      air(0.25, (u, t) => 300 + 1500 * Math.exp(-30 * t), (u, t) => 0.45 * Math.exp(-18 * t), 1.4, 11),
    ),
    0.25,
    0.78,
    0.9,
  ),
  0.9,
);

// ---------- interface ----------

// pop: bolha, para cartões surgindo
save(
  "pop",
  tone(0.12, (u, t) => 260 + 620 * Math.exp(-38 * t), (u, t) => attack(3)(u, t) * Math.exp(-34 * t)),
);

// click: interruptor, para blocos encaixando
save(
  "click",
  mix(
    air(0.012, () => 3500, (u) => (1 - u) ** 2, 1.2, 12),
    tone(0.04, () => 1500, (u, t) => 0.5 * Math.exp(-160 * t)),
    tone(0.06, () => 420, (u, t) => 0.6 * Math.exp(-70 * t)),
  ),
  0.8,
);

// key1 / key2: teclas de teclado (clique + corpo grave), duas variações
const key = (clickHz, bodyHz, seed) =>
  mix(
    air(0.018, () => clickHz, (u) => (1 - u) ** 3, 1.1, seed),
    tone(0.05, () => bodyHz, (u, t) => 0.7 * attack(1)(u, t) * Math.exp(-90 * t)),
  );
save("key1", key(2400, 170, 13), 0.7);
save("key2", key(1900, 140, 14), 0.7);

// error: dois toques graves e abafados, para os problemas marcados com X
const buzz = (f) =>
  mix(
    tone(0.085, () => f, (u) => Math.sin(Math.PI * u) ** 0.6),
    tone(0.085, () => f * 3, (u) => 0.22 * Math.sin(Math.PI * u)),
    tone(0.085, () => f * 5, (u) => 0.08 * Math.sin(Math.PI * u)),
  );
save("error", mix(buzz(165), at(0.12, buzz(139))), 0.8);

// blip: tom curto subindo, para barras de gráfico crescendo
save(
  "blip",
  tone(0.16, (u) => 380 + 260 * u, (u, t) => attack(4)(u, t) * Math.sin(Math.PI * Math.min(1, u * 1.05)) ** 1.5),
  0.7,
);

// ---------- conversa ----------

// send: mensagem enviada (deslize para cima)
save(
  "send",
  mix(
    tone(0.17, (u) => 520 + 520 * u ** 0.7, (u) => Math.sin(Math.PI * u) ** 1.2),
    tone(0.17, (u) => 1040 + 1040 * u ** 0.7, (u) => 0.15 * Math.sin(Math.PI * u) ** 2),
  ),
  0.7,
);

// receive: resposta chegando (duas notas suaves)
save("receive", reverb(mix(marimba(659.3, 0.4), at(0.1, marimba(880, 0.5))), 0.22), 0.75);

// ---------- musicais (o tom muda pela velocidade de reprodução) ----------

// note: marimba em dó, para etiquetas e etapas
save("note", reverb(marimba(523.25, 0.5), 0.18), 0.8);

// sparkle: brilho agudo, para as estrelas
save("sparkle", reverb(bell(2093, 0.4, 14), 0.3, 0.7, 0.5), 0.6);

// chime: sino médio, para destaques pontuais
save("chime", reverb(bell(1046.5, 0.8, 7), 0.25), 0.7);

// success: arpejo de conclusão (dó-mi-sol-dó)
save(
  "success",
  reverb(
    mix(
      bell(523.25, 1.2, 5),
      at(0.07, bell(659.25, 1.1, 5)),
      at(0.14, bell(783.99, 1.0, 5)),
      at(0.21, gain(bell(1046.5, 1.0, 4.5), 1.1)),
    ),
    0.3,
    0.8,
    1.0,
  ),
  0.75,
);

// ---------- amostras para escolher ----------
// node scripts/make-sfx.mjs --amostras  →  out/amostras/*.wav
// Variações de troca de cena e de digitação que ainda não estão no vídeo.
if (process.argv.includes("--amostras")) {
  const dir = join(outDir, "..", "..", "out", "amostras");
  mkdirSync(dir, { recursive: true });
  const sample = (name, sound, peak = 0.8) => save(name, sound, peak, dir);
  const square = (seconds, freq, envAt) =>
    render(seconds, (u, t) => Math.sign(Math.sin(TAU * freq * t)) * envAt(u, t));

  // --- trocas de cena ---
  sample(
    "troca-05-chicote-rapido",
    pan(air(0.16, (u) => 900 + 4500 * Math.sin(Math.PI * u) ** 2, (u) => Math.sin(Math.PI * u) ** 3, 1.3, 21), (u) => -0.6 + 1.2 * u),
  );
  sample(
    "troca-06-prato-reverso",
    reverb(air(0.55, (u) => 3000 + 3000 * u, (u) => Math.exp(6 * (u - 1)) * (u > 0.97 ? (1 - u) / 0.03 : 1), 1.6, 22), 0.2, 0.7, 0.4),
  );
  sample(
    "troca-07-boom-cinematico",
    reverb(
      mix(
        tone(1.0, (u, t) => 34 + 70 * Math.exp(-14 * t), (u, t) => attack(3)(u, t) * Math.exp(-3.2 * t)),
        air(0.4, (u, t) => 200 + 900 * Math.exp(-20 * t), (u, t) => 0.4 * Math.exp(-10 * t), 1.5, 23),
      ),
      0.35, 0.82, 1.2,
    ),
    0.9,
  );
  sample(
    "troca-08-glitch-digital",
    mix(
      ...[0, 1, 2, 3, 4, 5].map((i) =>
        at(i * 0.035, gain(square(0.025, [880, 1760, 660, 2640, 1320, 3520][i], (u) => (1 - u) ** 0.5), 0.5)),
      ),
      at(0.02, air(0.2, () => 5000, (u) => 0.3 * (u * 12 % 1 > 0.5 ? 1 : 0) * (1 - u), 1.2, 24)),
    ),
    0.55,
  );
  sample(
    "troca-09-brilho-subindo",
    reverb(mix(...[0, 1, 2, 3, 4, 5].map((i) => at(i * 0.045, gain(bell(1046.5 * [1, 1.26, 1.498, 2, 2.52, 3][i], 0.35, 14), 0.8)))), 0.35, 0.78, 0.8),
    0.6,
  );
  sample(
    "troca-10-subida-e-batida",
    mix(
      air(0.35, (u) => 300 + 3000 * u * u, (u) => u * u * (u > 0.93 ? (1 - u) / 0.07 : 1) * 0.6, 1.3, 25),
      at(0.35, tone(0.3, (u, t) => 50 + 90 * Math.exp(-28 * t), (u, t) => attack(2)(u, t) * Math.exp(-12 * t))),
    ),
  );
  sample(
    "troca-11-deslize-tonal",
    reverb(tone(0.3, (u) => 1400 * Math.exp(-2.2 * u) + 180, (u) => Math.sin(Math.PI * u) ** 1.5), 0.2, 0.7, 0.4),
    0.6,
  );
  sample(
    "troca-12-obturador-camera",
    mix(
      air(0.02, () => 3000, (u) => (1 - u) ** 2, 1.1, 26),
      tone(0.04, () => 900, (u, t) => 0.5 * Math.exp(-120 * t)),
      at(0.07, air(0.03, () => 2200, (u) => 0.8 * (1 - u) ** 2, 1.1, 27)),
      at(0.07, tone(0.06, () => 300, (u, t) => 0.6 * Math.exp(-60 * t))),
    ),
  );
  sample(
    "troca-13-vento-longo",
    pan(air(1.3, (u) => 120 + 500 * Math.sin(Math.PI * u) ** 2, (u) => Math.sin(Math.PI * u) ** 2, 1.7, 28), (u) => -0.9 + 1.8 * u),
    0.6,
  );
  sample(
    "troca-14-pluck-e-ar",
    reverb(
      mix(
        marimba(392, 0.4),
        gain(air(0.3, (u) => 600 + 1800 * u, (u) => Math.sin(Math.PI * u) ** 2, 1.5, 29), 0.35),
      ),
      0.25,
    ),
  );

  // --- digitação: cada estilo é uma sequência de ~1,3 s ---
  const sequence = (keys, count = 14, interval = 0.092) =>
    mix(
      ...Array.from({ length: count }, (_, i) => {
        const v = (i * 7) % 5; // variação fixa, não aleatória
        return at(Math.max(0, i * interval + (v - 2) * 0.006), gain(keys[v % keys.length], 0.75 + v * 0.06));
      }),
    );

  // teclado mecânico: clique agudo ao descer + clique menor ao soltar
  const mech = (hz, seed) =>
    mix(
      air(0.012, () => hz, (u) => (1 - u) ** 2, 0.9, seed),
      tone(0.03, () => hz * 0.55, (u, t) => 0.4 * Math.exp(-150 * t)),
      at(0.045, gain(air(0.01, () => hz * 1.2, (u) => (1 - u) ** 2, 0.9, seed + 1), 0.45)),
    );
  sample("digitacao-03-teclado-mecanico", sequence([mech(3800, 31), mech(3300, 33), mech(4200, 35)]), 0.7);

  // notebook: batida abafada, quase sem clique
  const soft = (hz, seed) =>
    mix(
      tone(0.05, () => hz, (u, t) => attack(2)(u, t) * Math.exp(-80 * t)),
      gain(air(0.02, () => 900, (u) => (1 - u) ** 3, 1.5, seed), 0.35),
    );
  sample("digitacao-04-notebook-suave", sequence([soft(150, 41), soft(130, 42), soft(170, 43)]), 0.7);

  // máquina de escrever: estalo metálico + sininho no final
  const clack = (hz, seed) =>
    mix(
      air(0.03, () => hz, (u) => (1 - u) ** 2, 0.7, seed),
      tone(0.07, () => 240, (u, t) => 0.6 * Math.exp(-55 * t)),
      tone(0.05, () => hz * 1.9, (u, t) => 0.2 * Math.exp(-90 * t)),
    );
  sample(
    "digitacao-05-maquina-de-escrever",
    mix(sequence([clack(2600, 51), clack(2200, 52), clack(3000, 53)], 12, 0.1), at(1.25, gain(reverb(bell(2637, 0.6, 8), 0.3)[0], 0.5))),
    0.75,
  );

  // interface futurista: bipes curtos
  const beep = (hz) => tone(0.035, () => hz, (u) => Math.sin(Math.PI * u) ** 0.8);
  sample("digitacao-06-bipes-digitais", sequence([beep(1800), beep(2100), beep(1600), beep(2400)], 16, 0.075), 0.45);

  // teclado de celular: "toc" arredondado
  const tock = (hz) => tone(0.045, (u, t) => hz + 500 * Math.exp(-90 * t), (u, t) => attack(1.5)(u, t) * Math.exp(-70 * t));
  sample("digitacao-07-teclado-de-celular", sequence([tock(620), tock(560), tock(680)]), 0.6);

  // gotas: bolhinhas agudas, mais lúdico
  const drip = (hz) => tone(0.06, (u, t) => hz * (1 + 0.6 * (1 - Math.exp(-60 * t))), (u, t) => attack(2)(u, t) * Math.exp(-55 * t));
  sample("digitacao-08-bolhinhas", sequence([drip(900), drip(1100), drip(800), drip(1250)]), 0.55);
}
