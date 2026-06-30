import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { NexusLandingContent, CONTENT_SECTIONS } from "./components/NexusLandingContent";
import { OutroOverlay } from "./components/OutroOverlay";
import { AmbientOrbs } from "./components/AmbientOrbs";
import { FilmGrain } from "./components/FilmGrain";
import { Vignette } from "./components/Vignette";
import { ScrollHUD } from "./components/ScrollHUD";
import { NexusLogoOverlay } from "./components/NexusLogoOverlay";

export type NexusScrollProps = {
  variant: "landscape" | "portrait";
};

function computeSceneScroll(
  frame: number,
  scrollStart: number,
  scrollEnd: number,
  sectionHeight: number,
  maxScroll: number
): number {
  const scrollSectionCount = CONTENT_SECTIONS - 1;
  const scrollDuration = scrollEnd - scrollStart;
  if (scrollDuration <= 0) return 0;

  const elapsed = Math.max(0, Math.min(frame - scrollStart, scrollDuration));
  const framesPerScene = scrollDuration / scrollSectionCount;
  const sceneIndex = Math.min(
    Math.floor(elapsed / framesPerScene),
    scrollSectionCount
  );
  const sceneLocal = (elapsed - sceneIndex * framesPerScene) / framesPerScene;
  const eased = Easing.inOut(Easing.cubic)(Math.min(1, sceneLocal));
  const scrollY = Math.min((sceneIndex + eased) * sectionHeight, maxScroll);
  return scrollY;
}

export const NexusScroll: React.FC<NexusScrollProps> = () => {
  const frame = useCurrentFrame();
  const { height, durationInFrames, fps } = useVideoConfig();

  const sectionHeight = height;
  const contentHeight = CONTENT_SECTIONS * sectionHeight;
  const maxScroll = contentHeight - height;

  const introHold = fps * 2.5;
  const outroDuration = fps * 4;
  const scrollStart = introHold;
  const scrollEnd = durationInFrames - outroDuration;

  const scrollY = computeSceneScroll(
    frame,
    scrollStart,
    scrollEnd,
    sectionHeight,
    maxScroll
  );

  const cameraScale = interpolate(
    scrollY,
    [0, maxScroll * 0.5, maxScroll],
    [1, 0.97, 0.94],
    { extrapolateRight: "clamp" }
  );

  const cameraRotateX = interpolate(
    scrollY,
    [0, maxScroll],
    [0, 2.5],
    { extrapolateRight: "clamp" }
  );

  const chromaticShift = interpolate(
    frame,
    [scrollStart, scrollEnd],
    [0, 1.5],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const outroOpacity = interpolate(
    frame,
    [scrollEnd, durationInFrames - fps * 0.5],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const outroScale = interpolate(
    frame,
    [scrollEnd, durationInFrames],
    [0.92, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "#060810", overflow: "hidden" }}>
      <AmbientOrbs scrollY={scrollY} />

      <div
        style={{
          position: "absolute",
          inset: 0,
          perspective: 1400,
          perspectiveOrigin: "50% 45%",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            transform: `scale(${cameraScale}) rotateX(${cameraRotateX}deg)`,
            transformOrigin: "50% 50%",
            transformStyle: "preserve-3d",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              transform: `translateY(${-scrollY}px)`,
              filter: chromaticShift > 0.1 ? `hue-rotate(${chromaticShift}deg)` : undefined,
            }}
          >
            <NexusLandingContent
              sectionHeight={sectionHeight}
              viewportHeight={height}
              scrollY={scrollY}
              frame={frame}
              introHold={introHold}
            />
          </div>
        </div>
      </div>

      <NexusLogoOverlay introHold={introHold} />
      <Vignette />
      <FilmGrain />
      <ScrollHUD
        scrollY={scrollY}
        maxScroll={maxScroll}
        introHold={introHold}
        scrollEnd={scrollEnd}
      />
      <OutroOverlay opacity={outroOpacity} scale={outroScale} />
    </AbsoluteFill>
  );
};
