import { useEffect, useRef } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Painel from "@/pages/Painel";
import Conversa from "@/pages/Conversa";
import Admin from "@/pages/Admin";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

const CADASTRO_URL = "https://gestaonexuscrm.online/cadastro/ed2b33b8ad731816210c798b1d8e5b90";

function RedirectCadastro() {
  useEffect(() => {
    window.location.replace(CADASTRO_URL);
  }, []);
  return null;
}

function PixelPageView() {
  const location = useLocation();
  const firstLoad = useRef(true);

  useEffect(() => {
    if (firstLoad.current) {
      firstLoad.current = false;
      return;
    }
    window.fbq?.("track", "PageView");
  }, [location.pathname]);

  return null;
}

export default function App() {
  return (
    <>
      <PixelPageView />
      <Routes>
        <Route path="/formulario" element={<RedirectCadastro />} />
        <Route path="/painel" element={<Painel />} />
        <Route path="/conversa" element={<Conversa />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<Navigate to="/painel" replace />} />
      </Routes>
    </>
  );
}
