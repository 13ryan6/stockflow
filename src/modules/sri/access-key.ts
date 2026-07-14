import { randomInt } from "crypto";
import { SriValidationError } from "./errors";
import type { SriDocumentCode, SriEnvironmentCode } from "./types";

export interface SriAccessKeyInput {
  issueDate: Date | string;
  ruc: string;
  environmentCode: SriEnvironmentCode;
  establishment: string;
  emissionPoint: string;
  sequential: string;
  documentCode?: SriDocumentCode;
  emissionType?: string;
  numericCode?: string;
}

function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

function padNumeric(value: string, length: number, fieldName: string) {
  const normalized = digitsOnly(value);

  if (normalized.length > length) {
    throw new SriValidationError(`El campo ${fieldName} excede ${length} dígitos`, { fieldName, value });
  }

  return normalized.padStart(length, "0");
}

function formatSriDate(date: Date | string) {
  const parsed = date instanceof Date ? date : new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    throw new SriValidationError("La fecha del comprobante no es válida", { date });
  }

  const day = String(parsed.getDate()).padStart(2, "0");
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const year = String(parsed.getFullYear());

  return `${day}${month}${year}`;
}

export function generateSriNumericCode() {
  return String(randomInt(0, 100000000)).padStart(8, "0");
}

export function calculateModulo11Verifier(baseDigits: string) {
  if (!/^\d{48}$/.test(baseDigits)) {
    throw new SriValidationError("La base de la clave de acceso debe tener 48 dígitos", {
      baseDigits,
      length: baseDigits.length,
    });
  }

  const weights = [2, 3, 4, 5, 6, 7];
  let sum = 0;

  for (let index = 0; index < baseDigits.length; index += 1) {
    const digit = Number(baseDigits[baseDigits.length - 1 - index]);
    const weight = weights[index % weights.length];
    sum += digit * weight;
  }

  const remainder = sum % 11;
  const verifier = 11 - remainder;

  if (verifier === 11) return "0";
  if (verifier === 10) return "1";

  return String(verifier);
}

export function buildSriAccessKey(input: SriAccessKeyInput) {
  const documentCode = input.documentCode ?? "01";
  const emissionType = input.emissionType ?? "1";
  const numericCode = input.numericCode ?? generateSriNumericCode();

  const baseDigits = [
    formatSriDate(input.issueDate),
    padNumeric(documentCode, 2, "documentCode"),
    padNumeric(input.ruc, 13, "ruc"),
    String(input.environmentCode),
    padNumeric(input.establishment, 3, "establishment"),
    padNumeric(input.emissionPoint, 3, "emissionPoint"),
    padNumeric(input.sequential, 9, "sequential"),
    padNumeric(numericCode, 8, "numericCode"),
    padNumeric(emissionType, 1, "emissionType"),
  ].join("");

  return `${baseDigits}${calculateModulo11Verifier(baseDigits)}`;
}

export { formatSriDate };