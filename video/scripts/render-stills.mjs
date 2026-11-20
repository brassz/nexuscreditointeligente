// Renderiza quadros de conferência de cada cena em out/quadros/.
// Uso: npm run quadros            → um quadro no fim de cada cena (tudo já na tela)
//      npm run quadros -- 0.5     → um quadro na metade de cada cena (0 a 1)
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const { scenes, transition } = JSON.parse(readFileSync(join(root, "src", "narration.json"), "utf8"));
const at = process.argv[2] === undefined ? null : Number(process.argv[2]);
mkdirSync(join(root, "out", "quadros"), { recursive: true });

scenes.forEach((scene, i) => {
  const local = at === null ? scene.frames - transition - 8 : Math.round((scene.frames - 1) * at);
  const frame = scene.start + local;
  const name = `${String(i + 1).padStart(2, "0")}-${scene.id}${at === null ? "" : `-${Math.round(at * 100)}`}.png`;
  execFileSync(
    "npx",
    ["remotion", "still", "src/index.ts", "NexusInstitucional", join("out", "quadros", name), `--frame=${frame}`, "--log=error"],
    { cwd: root, stdio: "inherit", shell: true },
  );
  console.log(`${name}  (frame ${frame})`);
});
