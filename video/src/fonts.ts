// Mesmas famílias do site: Inter Tight (títulos), Inter (texto) e Fira Mono (detalhes).
// São baixadas do Google Fonts na hora do render (exige internet na primeira vez).
import { loadFont as loadInterTight } from "@remotion/google-fonts/InterTight";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadFiraMono } from "@remotion/google-fonts/FiraMono";

const subsets = ["latin" as const];

export const display = loadInterTight("normal", { weights: ["400", "500", "600"], subsets }).fontFamily;
export const body = loadInter("normal", { weights: ["400", "500", "600"], subsets }).fontFamily;
export const mono = loadFiraMono("normal", { weights: ["400", "500"], subsets }).fontFamily;
