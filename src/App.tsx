import { useEffect, useRef } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Formulario from "@/pages/Formulario";
import Painel from "@/pages/Painel";
import Conversa from "@/pages/Conversa";
import Admin from "@/pages/Admin";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
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
        <Route path="/formulario" element={<Formulario />} />
        <Route path="/painel" element={<Painel />} />
        <Route path="/conversa" element={<Conversa />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<Navigate to="/formulario" replace />} />
      </Routes>
    </>
  );
}
