import { z } from "zod";
import { CompositionProps } from "../../types/constants";
import { useRendering } from "../helpers/use-rendering";
import { AlignEnd } from "./AlignEnd";
import { Button } from "./Button";
import { DownloadButton } from "./DownloadButton";
import { ErrorComp } from "./Error";
import { ProgressBar } from "./ProgressBar";
import { Spacing } from "./Spacing";
import { InputContainer } from "./Container";

export const RenderControls: React.FC<{
  compositionId: string;
  inputProps: z.infer<typeof CompositionProps>;
}> = ({ compositionId, inputProps }) => {
  const { renderMedia, state, undo } = useRendering(compositionId, inputProps);

  return (
    <InputContainer>
      {state.status === "init" ||
      state.status === "invoking" ||
      state.status === "error" ? (
        <>
          <p className="text-sm text-white/60 mb-4">
            Renderize na Vercel Sandbox e baixe o MP4 quando estiver pronto.
            Configure <code className="text-cyan-400">BLOB_READ_WRITE_TOKEN</code>{" "}
            no arquivo <code className="text-cyan-400">.env</code>.
          </p>
          <AlignEnd>
            <Button
              disabled={state.status === "invoking"}
              loading={state.status === "invoking"}
              onClick={renderMedia}
            >
              Renderizar vídeo
            </Button>
          </AlignEnd>
          {state.status === "invoking" ? (
            <>
              <Spacing />
              <div
                style={{
                  fontSize: 14,
                  lineHeight: 1.5,
                  minHeight: "2.5em",
                  marginBottom: 8,
                }}
              >
                <div style={{ color: "#aaa" }}>
                  {state.phase}
                  {state.progress < 1
                    ? ` ${Math.max(Math.round(state.progress * 100), 1)}%`
                    : null}
                </div>
                <div
                  style={{
                    color: "#666",
                    fontSize: 12,
                    visibility: state.subtitle ? "visible" : "hidden",
                  }}
                >
                  {state.subtitle ?? "\u00A0"}
                </div>
              </div>
              <ProgressBar progress={state.progress} />
            </>
          ) : null}
          {state.status === "error" ? (
            <ErrorComp message={state.error.message} />
          ) : null}
        </>
      ) : null}
      {state.status === "done" ? (
        <>
          <ProgressBar progress={1} />
          <Spacing />
          <AlignEnd>
            <DownloadButton undo={undo} state={state} />
          </AlignEnd>
        </>
      ) : null}
    </InputContainer>
  );
};
