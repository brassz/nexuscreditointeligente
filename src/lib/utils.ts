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

export function formatCnpj(value: string): string {
  const digits = onlyDigits(value).slice(0, 14);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  }
  if (digits.length <= 12) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  }
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}

export function isValidCnpj(value: string): boolean {
  const digits = onlyDigits(value);
  if (digits.length !== 14) return false;
  if (/^(\d)\1+$/.test(digits)) return false;

  const calcDigit = (base: string, weights: number[]) => {
    let sum = 0;
    for (let i = 0; i < weights.length; i++) {
      sum += Number(base[i]) * weights[i];
    }
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const base12 = digits.slice(0, 12);
  const d1 = calcDigit(base12, w1);
  if (d1 !== Number(digits[12])) return false;
  const d2 = calcDigit(base12 + d1, w2);
  return d2 === Number(digits[13]);
}
