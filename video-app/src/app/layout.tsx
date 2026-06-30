import { Metadata, Viewport } from "next";
import "../../styles/global.css";

export const metadata: Metadata = {
  title: "Crédito Inteligente — Estúdio de Vídeo",
  description: "Pré-visualize e renderize vídeos Crédito Inteligente",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-[#060810] text-white antialiased">{children}</body>
    </html>
  );
}
