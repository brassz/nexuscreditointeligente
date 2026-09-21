import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Painel from "@/pages/Painel";
import Conversa from "@/pages/Conversa";
import Admin from "@/pages/Admin";

const CADASTRO_URL = "https://gestaonexuscrm.online/cadastro/ed2b33b8ad731816210c798b1d8e5b90";

function RedirectCadastro() {
  useEffect(() => {
    window.location.replace(CADASTRO_URL);
  }, []);
  return null;
}

export default function App() {
  return (
    <Routes>
      <Route path="/formulario" element={<RedirectCadastro />} />
      <Route path="/painel" element={<Painel />} />
      <Route path="/conversa" element={<Conversa />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="*" element={<Navigate to="/painel" replace />} />
    </Routes>
  );
}
