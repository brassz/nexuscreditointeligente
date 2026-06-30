import { loadFont as loadSpaceGrotesk } from "@remotion/google-fonts/SpaceGrotesk";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";

const { fontFamily: displayFont } = loadSpaceGrotesk("normal", {
  weights: ["700"],
  subsets: ["latin"],
});

const { fontFamily: bodyFont } = loadInter("normal", {
  weights: ["400", "500", "600"],
  subsets: ["latin"],
});

export const fonts = {
  display: displayFont,
  body: bodyFont,
};
