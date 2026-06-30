import { Composition } from "remotion";
import {
  COMP_NAME_LANDSCAPE,
  COMP_NAME_PORTRAIT,
  DURATION_IN_FRAMES,
  FORMATS,
  defaultNexusScrollProps,
  VIDEO_FPS,
} from "../../types/constants";
import { NexusScroll } from "./nexus/NexusScroll";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id={COMP_NAME_LANDSCAPE}
        component={NexusScroll}
        durationInFrames={DURATION_IN_FRAMES}
        fps={VIDEO_FPS}
        width={FORMATS.landscape.width}
        height={FORMATS.landscape.height}
        defaultProps={{ variant: "landscape" as const }}
      />
      <Composition
        id={COMP_NAME_PORTRAIT}
        component={NexusScroll}
        durationInFrames={DURATION_IN_FRAMES}
        fps={VIDEO_FPS}
        width={FORMATS.portrait.width}
        height={FORMATS.portrait.height}
        defaultProps={{ variant: "portrait" as const }}
      />
    </>
  );
};
