// Renderiza o vídeo final em out/, sempre com um nome novo (v01, v02, ...),
// para nunca sobrescrever um arquivo que esteja aberto no player.
// Depois ajusta o volume geral para o padrão de vídeo online (-16 LUFS) sem recodificar a imagem.
// Uso: npm run render
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "out");
mkdirSync(out, { recursive: true });

let version = 1;
const file = () => join(out, `nexus-institucional-v${String(version).padStart(2, "0")}.mp4`);
while (existsSync(file())) version++;
const raw = join(out, `_bruto-v${version}.mp4`);

execFileSync(
  "npx",
  ["remotion", "render", "src/index.ts", "NexusInstitucional", `"${raw}"`, "--codec=h264", "--crf=17", "--audio-bitrate=256k", "--log=error"],
  { cwd: root, stdio: "inherit", shell: true },
);

// Mede o volume médio do vídeo inteiro e aplica um ganho único (sem "bombear"
// os trechos baixos, o que desfaria o equilíbrio entre voz e trilha).
const ALVO = -16; // LUFS
const medida = spawnSync("ffmpeg", ["-hide_banner", "-nostats", "-i", raw, "-af", "ebur128", "-f", "null", "-"], { encoding: "utf8" }).stderr;
const atual = Number(medida.match(/I:\s+(-?[\d.]+) LUFS/g).at(-1).match(/-?[\d.]+/)[0]);
const ganho = (ALVO - atual).toFixed(1);
console.log(`Volume medido: ${atual} LUFS → ganho de ${ganho} dB`);

execFileSync(
  "ffmpeg",
  ["-y", "-v", "error", "-i", raw, "-c:v", "copy", "-af", `volume=${ganho}dB,alimiter=limit=0.84:level=false`, "-ar", "48000", "-c:a", "aac", "-b:a", "256k", "-movflags", "+faststart", file()],
  { stdio: "inherit" },
);
rmSync(raw);
console.log(`\nVídeo pronto: ${file()}`);
