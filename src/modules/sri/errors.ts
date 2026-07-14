export class SriError extends Error {
  readonly code: string;
  readonly details?: unknown;

  constructor(message: string, code = "SRI_ERROR", details?: unknown) {
    super(message);
    this.name = new.target.name;
    this.code = code;
    this.details = details;
  }
}

export class SriConfigurationError extends SriError {
  constructor(message: string, details?: unknown) {
    super(message, "SRI_CONFIGURATION_ERROR", details);
  }
}

export class SriModuleDisabledError extends SriError {
  constructor() {
    super("El módulo SRI está desactivado", "SRI_MODULE_DISABLED");
  }
}

export class SriValidationError extends SriError {
  constructor(message: string, details?: unknown) {
    super(message, "SRI_VALIDATION_ERROR", details);
  }
}

export interface SriMessageDetail {
  identificador?: string;
  mensaje: string;
  informacionAdicional?: string;
  tipo?: string;
}

export class SriReceptionRejectedError extends SriError {
  readonly messages: SriMessageDetail[];

  constructor(message: string, messages: SriMessageDetail[], details?: unknown) {
    super(message, "SRI_RECEPTION_REJECTED", details);
    this.messages = messages;
  }
}

export class SriAuthorizationRejectedError extends SriError {
  readonly messages: SriMessageDetail[];

  constructor(message: string, messages: SriMessageDetail[], details?: unknown) {
    super(message, "SRI_AUTHORIZATION_REJECTED", details);
    this.messages = messages;
  }
}

export class SriSignatureError extends SriError {
  constructor(message: string, details?: unknown) {
    super(message, "SRI_SIGNATURE_ERROR", details);
  }
}

export class SriSoapError extends SriError {
  constructor(message: string, details?: unknown) {
    super(message, "SRI_SOAP_ERROR", details);
  }
}