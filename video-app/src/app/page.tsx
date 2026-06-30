"use client";

import { Player } from "@remotion/player";
import type { NextPage } from "next";
import Image from "next/image";
import { useMemo, useState } from "react";
import {
  DURATION_IN_FRAMES,
  FORMATS,
  VIDEO_FPS,
  type VideoFormat,
} from "../../types/constants";
import { RenderControls } from "../components/RenderControls";
import { NexusScroll } from "../remotion/nexus/NexusScroll";

const Home: NextPage = () => {
  const [format, setFormat] = useState<VideoFormat>("landscape");
  const selected = FORMATS[format];

  const inputProps = useMemo(
    () => ({ variant: selected.variant }),
    [selected.variant]
  );

  return (
    <div className="min-h-screen bg-[#060810] text-white">
      <div className="max-w-4xl mx-auto px-4 py-12 flex flex-col items-center gap-10">
        <header className="flex flex-col items-center gap-5 text-center">
          <div className="relative">
            <div className="absolute inset-0 blur-3xl bg-cyan-400/20 rounded-full scale-150" />
            <Image
              src="/nexus-logo.png"
              alt="Crédito Inteligente"
              width={160}
              height={160}
              priority
              className="relative drop-shadow-[0_0_24px_rgba(0,212,255,0.6)]"
            />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Estúdio de vídeo
            </h1>
            <p className="text-sm text-white/60 mt-2 max-w-md">
              Pré-visualize e renderize o vídeo de scroll da landing com a logo
              centralizada no início.
            </p>
          </div>
        </header>

        <div className="w-full flex gap-2 justify-center">
          {(Object.keys(FORMATS) as VideoFormat[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setFormat(key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                format === key
                  ? "bg-cyan-500 text-black"
                  : "bg-white/10 text-white/70 hover:bg-white/15"
              }`}
            >
              {FORMATS[key].label}
            </button>
          ))}
        </div>

        <div className="w-full overflow-hidden rounded-xl shadow-[0_0_80px_rgba(0,212,255,0.12)] border border-white/10">
          <Player
            component={NexusScroll}
            inputProps={inputProps}
            durationInFrames={DURATION_IN_FRAMES}
            fps={VIDEO_FPS}
            compositionHeight={selected.height}
            compositionWidth={selected.width}
            style={{ width: "100%" }}
            controls
            autoPlay
            loop
            initiallyMuted
          />
        </div>

        <section className="w-full">
          <RenderControls
            compositionId={selected.id}
            inputProps={inputProps}
          />
        </section>
      </div>
    </div>
  );
};

export default Home;
