import { Composition } from "remotion";
import { NexusScroll } from "./NexusScroll";

const FPS = 30;
const DURATION = 30 * FPS;

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="NexusScroll-16x9"
        component={NexusScroll}
        durationInFrames={DURATION}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={{ variant: "landscape" as const }}
      />
      <Composition
        id="NexusScroll-9x16"
        component={NexusScroll}
        durationInFrames={DURATION}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{ variant: "portrait" as const }}
      />
    </>
  );
};
