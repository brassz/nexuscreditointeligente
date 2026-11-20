// Gera a narração com a voz neural gratuita do Microsoft Edge (sem conta, sem chave).
// Uso: npm run voz  →  public/voz/*.mp3 + src/narration.json
// ATENÇÃO: o texto do roteiro é enviado aos servidores da Microsoft e exige internet.
// `npm run voz -- --sem-rede` recalcula só a linha do tempo com os áudios já existentes.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, copyFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { cenas, FPS, GRADE, TRANSICAO, VOZ } from "./roteiro.mjs";

const semRede = process.argv.includes("--sem-rede");
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public", "voz");
mkdirSync(outDir, { recursive: true });

/** O serviço às vezes derruba a conexão; tenta de novo algumas vezes. */
const synthesize = async (text, file) => {
  const { MsEdgeTTS, OUTPUT_FORMAT } = await import("msedge-tts");
  for (let attempt = 1; ; attempt++) {
    const tmp = mkdtempSync(join(tmpdir(), "voz-"));
    const tts = new MsEdgeTTS();
    try {
      await tts.setMetadata(VOZ, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);
      const { audioFilePath } = await tts.toFile(tmp, text);
      copyFileSync(audioFilePath, file);
      return;
    } catch (error) {
      if (attempt >= 4) throw error;
      console.log(`  tentativa ${attempt} falhou (${error.message}); tentando de novo…`);
      await new Promise((resolve) => setTimeout(resolve, 1500 * attempt));
    } finally {
      tts.close();
      rmSync(tmp, { recursive: true, force: true });
    }
  }
};

const probe = (file) =>
  Number(
    execFileSync("ffprobe", [
      "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file,
    ]).toString(),
  );

const ceilTo = (value, step) => Math.ceil(value / step) * step;

// Linha do tempo: cada cena dura o que a fala precisa e começa numa batida da trilha.
const scenes = [];
let start = 0;
for (const cena of cenas) {
  const file = join(outDir, `${cena.id}.mp3`);
  if (!semRede) await synthesize(cena.texto, file);
  if (!existsSync(file)) throw new Error(`Falta o áudio ${file}. Rode "npm run voz" com internet.`);
  const seconds = probe(file);
  const voiceAt = Math.round(cena.vozEm * FPS);
  const needed = Math.max(
    Math.round(cena.minimo * FPS),
    voiceAt + Math.ceil(seconds * FPS) + Math.round(cena.respiro * FPS),
  );
  const last = cena === cenas.at(-1);
  // `step` é a distância até o início da próxima cena; a cena em si dura um pouco
  // mais (TRANSICAO) para as duas se sobreporem durante a troca.
  const step = ceilTo(needed, GRADE);
  scenes.push({
    id: cena.id,
    text: cena.texto,
    seconds: Math.round(seconds * 100) / 100,
    start,
    frames: last ? step : step + TRANSICAO,
    voiceAt,
  });
  console.log(`${cena.id.padEnd(13)} fala ${seconds.toFixed(2)}s  cena ${(step / FPS).toFixed(1)}s`);
  start += step;
}

writeFileSync(
  join(root, "src", "narration.json"),
  JSON.stringify({ fps: FPS, transition: TRANSICAO, totalFrames: start, scenes }, null, 2) + "\n",
);
console.log(`Duração total: ${(start / FPS).toFixed(1)}s (${start} frames)`);
