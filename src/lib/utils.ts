import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function redirectToFormulario() {
  window.location.assign("/formulario");
}

export function redirectToHome() {
  window.location.assign("/");
}

export function formatWhatsApp(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length < 10) return value;
  const ddd = digits.slice(0, 2);
  const rest = digits.slice(2);
  if (rest.length === 9) {
    return `(${ddd}) ${rest.slice(0, 1)}${rest.slice(1, 5)}-${rest.slice(5)}`;
  }
  if (rest.length === 8) {
    return `(${ddd}) ${rest.slice(0, 4)}-${rest.slice(4)}`;
  }
  return value;
}

export function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatDatePtBR(dateStr: string): string {
  return new Date(dateStr).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function tempoCarteiraLabel(value: string | null | undefined): string {
  const map: Record<string, string> = {
    "menos-6": "Menos de 6 meses",
    "6-12": "Entre 6 e 12 meses",
    "mais-12": "Mais de 12 meses",
  };
  return value ? map[value] ?? value : "—";
}

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}
