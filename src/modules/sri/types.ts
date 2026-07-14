export type SriEnvironmentName = "DEV" | "PROD";
export type SriEnvironmentCode = 1 | 2;
export type SriDocumentCode = "01";
export type SriIdentificationType = "04" | "05" | "06" | "07";

export interface SriCompanyData {
  razonSocial: string;
  ruc: string;
  dirMatriz: string;
  nombreComercial?: string | null;
  contribuyenteEspecial?: string | null;
  obligadoContabilidad?: boolean | null;
  direccionEstablecimiento?: string | null;
}

export interface SriBuyerData {
  identificacion: string;
  razonSocial: string;
  tipoIdentificacion?: SriIdentificationType;
  direccion?: string | null;
  telefono?: string | null;
  email?: string | null;
}

export interface SriTaxDetail {
  codigo: string;
  codigoPorcentaje: string;
  baseImponible: string | number;
  tarifa: string | number;
  valor: string | number;
}

export interface SriInvoiceLine {
  codigoPrincipal: string;
  codigoAuxiliar?: string | null;
  descripcion: string;
  cantidad: string | number;
  precioUnitario: string | number;
  descuento?: string | number | null;
  precioTotalSinImpuesto: string | number;
  impuestos?: SriTaxDetail[];
}

export interface SriInvoiceTotals {
  totalSinImpuestos: string | number;
  totalDescuento: string | number;
  totalConImpuestos: SriTaxDetail[];
  propina?: string | number | null;
  importeTotal: string | number;
  moneda?: string | null;
}

export interface SriPaymentMethod {
  formaPago: string;
  total: string | number;
  plazo?: string | number | null;
  unidadTiempo?: string | null;
}

export interface SriAdditionalField {
  nombre: string;
  valor: string;
}

export interface SriInvoiceXmlInput {
  environmentCode: SriEnvironmentCode;
  accessKey: string;
  issueDate: Date | string;
  company: SriCompanyData;
  buyer: SriBuyerData;
  establishment: string;
  emissionPoint: string;
  sequential: string;
  documentCode?: SriDocumentCode;
  emissionType?: string;
  numericCode?: string;
  details: SriInvoiceLine[];
  totals: SriInvoiceTotals;
  payments: SriPaymentMethod[];
  additionalFields?: SriAdditionalField[];
}

export interface SriEnvironmentUrls {
  reception: string;
  authorization: string;
}

export interface SriModuleConfig {
  enabled: boolean;
  environment: SriEnvironmentName;
  environmentCode: SriEnvironmentCode;
  urls: SriEnvironmentUrls;
  certificatePath: string;
  certificatePassword: string;
}

export interface SriReceptionMessage {
  identificador?: string;
  mensaje: string;
  informacionAdicional?: string;
  tipo?: string;
}

export interface SriReceptionResult {
  estado: string;
  messages: SriReceptionMessage[];
  raw: unknown;
  rawXml: string;
}

export interface SriAuthorizationResult {
  estado: string;
  numeroAutorizacion?: string;
  fechaAutorizacion?: string;
  ambiente?: string;
  comprobante?: string;
  messages: SriReceptionMessage[];
  raw: unknown;
  rawXml: string;
}

export interface SriInvoiceProcessResult {
  accessKey: string;
  unsignedXml: string;
  signedXml: string;
  reception: SriReceptionResult;
  authorization: SriAuthorizationResult;
  environment: SriEnvironmentName;
}