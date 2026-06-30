import { Routes, Route, Navigate } from "react-router-dom";
import Formulario from "@/pages/Formulario";
import Painel from "@/pages/Painel";
import Conversa from "@/pages/Conversa";
import Admin from "@/pages/Admin";

export default function App() {
  return (
    <Routes>
      <Route path="/formulario" element={<Formulario />} />
      <Route path="/painel" element={<Painel />} />
      <Route path="/conversa" element={<Conversa />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="*" element={<Navigate to="/formulario" replace />} />
    </Routes>
  );
}
