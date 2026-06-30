import type { Plugin } from "vite";

const REACT_ROUTES = ["/formulario", "/painel", "/conversa", "/admin"];

function spaFallback(): Plugin {
  const rewrite = (
    req: { url?: string },
    _res: unknown,
    next: () => void
  ) => {
    const url = req.url?.split("?")[0] ?? "";
    if (REACT_ROUTES.some((r) => url === r || url.startsWith(r + "/"))) {
      req.url = "/app.html";
    }
    next();
  };

  return {
    name: "spa-fallback",
    configureServer(server) {
      server.middlewares.use(rewrite);
    },
    configurePreviewServer(server) {
      server.middlewares.use(rewrite);
    },
  };
}

export default spaFallback;
