import { z } from "zod";
import { SriConfigurationError } from "./errors";
import type { SriEnvironmentCode, SriEnvironmentName, SriModuleConfig } from "./types";

const sriEnvSchema = z.object({
  ENVIRONMENT: z.enum(["DEV", "PROD"]),
  SRI_MODULE_ENABLED: z.string().optional(),
  SRI_DEV_RECEPCION: z.string().url(),
  SRI_DEV_AUTORIZACION: z.string().url(),
  SRI_PROD_RECEPCION: z.string().url(),
  SRI_PROD_AUTORIZACION: z.string().url(),
  SRI_CERTIFICATE_P12_PATH: z.string().min(1),
  SRI_CERTIFICATE_PASSWORD: z.string().min(1),
});

function parseBooleanFlag(value: string | undefined, defaultValue = true) {
  if (value === undefined) return defaultValue;
  const normalized = value.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  return defaultValue;
}

function toEnvironmentCode(environment: SriEnvironmentName): SriEnvironmentCode {
  return environment === "DEV" ? 1 : 2;
}

export function loadSriConfig(env = process.env): SriModuleConfig {
  const parsed = sriEnvSchema.safeParse(env);

  if (!parsed.success) {
    throw new SriConfigurationError("La configuración SRI es inválida", parsed.error.flatten());
  }

  const environment = parsed.data.ENVIRONMENT;
  const enabled = parseBooleanFlag(parsed.data.SRI_MODULE_ENABLED, true);
  const urls =
    environment === "DEV"
      ? {
          reception: parsed.data.SRI_DEV_RECEPCION,
          authorization: parsed.data.SRI_DEV_AUTORIZACION,
        }
      : {
          reception: parsed.data.SRI_PROD_RECEPCION,
          authorization: parsed.data.SRI_PROD_AUTORIZACION,
        };

  return {
    enabled,
    environment,
    environmentCode: toEnvironmentCode(environment),
    urls,
    certificatePath: parsed.data.SRI_CERTIFICATE_P12_PATH,
    certificatePassword: parsed.data.SRI_CERTIFICATE_PASSWORD,
  };
}