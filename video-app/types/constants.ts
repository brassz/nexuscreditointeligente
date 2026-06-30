import { z } from "zod";

export const COMP_NAME_LANDSCAPE = "NexusScroll-16x9";
export const COMP_NAME_PORTRAIT = "NexusScroll-9x16";
export const COMP_NAME = COMP_NAME_LANDSCAPE;

export const CompositionProps = z.object({
  variant: z.enum(["landscape", "portrait"]),
});

export const defaultNexusScrollProps: z.infer<typeof CompositionProps> = {
  variant: "landscape",
};

export const DURATION_IN_FRAMES = 30 * 30;
export const VIDEO_FPS = 30;

export const FORMATS = {
  landscape: {
    id: COMP_NAME_LANDSCAPE,
    width: 1920,
    height: 1080,
    variant: "landscape" as const,
    label: "16:9",
  },
  portrait: {
    id: COMP_NAME_PORTRAIT,
    width: 1080,
    height: 1920,
    variant: "portrait" as const,
    label: "9:16",
  },
} as const;

export type VideoFormat = keyof typeof FORMATS;

export const VIDEO_WIDTH = FORMATS.landscape.width;
export const VIDEO_HEIGHT = FORMATS.landscape.height;
