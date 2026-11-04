import { Routes, Route, Navigate } from "react-router-dom";
import Painel from "@/pages/Painel";
import Conversa from "@/pages/Conversa";
import Admin from "@/pages/Admin";
import Formulario from "@/pages/Formulario";

export default function App() {
  return (
    <Routes>
      <Route path="/formulario" element={<Formulario />} />
      <Route path="/painel" element={<Painel />} />
      <Route path="/conversa" element={<Conversa />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="*" element={<Navigate to="/painel" replace />} />
    </Routes>
  );
}
