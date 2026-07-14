import { create } from "xmlbuilder2";
import { SriValidationError } from "./errors";
import { formatSriDate } from "./access-key";
import type { SriInvoiceLine, SriInvoiceXmlInput, SriTaxDetail } from "./types";

function textValue(value: string | number | boolean | null | undefined) {
  if (value === undefined || value === null) return undefined;
  return String(value);
}

function formatDecimal(value: string | number | null | undefined) {
  if (value === undefined || value === null || value === "") return "0.00";

  const parsed = typeof value === "number" ? value : Number(String(value).replace(",", "."));

  if (Number.isNaN(parsed)) {
    throw new SriValidationError("El valor decimal del comprobante no es válido", { value });
  }

  return parsed.toFixed(2);
}

function yesNo(value: boolean | null | undefined) {
  return value ? "SI" : "NO";
}

function identificationType(value: string, explicitType?: string) {
  if (explicitType) return explicitType;

  const digits = value.replace(/\D/g, "");
  if (digits.length === 13) return "04";
  if (digits.length === 10) return "05";
  return "06";
}

function appendTextNode(parent: any, name: string, value: string | number | boolean | null | undefined) {
  const text = textValue(value);
  if (text === undefined || text === "") return;
  parent.ele(name).txt(text).up();
}

function appendTaxNode(parent: any, tax: SriTaxDetail) {
  const node = parent.ele("impuesto");
  appendTextNode(node, "codigo", tax.codigo);
  appendTextNode(node, "codigoPorcentaje", tax.codigoPorcentaje);
  appendTextNode(node, "tarifa", formatDecimal(tax.tarifa));
  appendTextNode(node, "baseImponible", formatDecimal(tax.baseImponible));
  appendTextNode(node, "valor", formatDecimal(tax.valor));
  node.up();
}

function appendPaymentNode(parent: any, payment: SriInvoiceXmlInput["payments"][number]) {
  const node = parent.ele("pago");
  appendTextNode(node, "formaPago", payment.formaPago);
  appendTextNode(node, "total", formatDecimal(payment.total));
  appendTextNode(node, "plazo", payment.plazo);
  appendTextNode(node, "unidadTiempo", payment.unidadTiempo);
  node.up();
}

function appendLineNode(parent: any, line: SriInvoiceLine) {
  const node = parent.ele("detalle");
  appendTextNode(node, "codigoPrincipal", line.codigoPrincipal);
  appendTextNode(node, "codigoAuxiliar", line.codigoAuxiliar);
  appendTextNode(node, "descripcion", line.descripcion);
  appendTextNode(node, "cantidad", formatDecimal(line.cantidad));
  appendTextNode(node, "precioUnitario", formatDecimal(line.precioUnitario));
  appendTextNode(node, "descuento", formatDecimal(line.descuento));
  appendTextNode(node, "precioTotalSinImpuesto", formatDecimal(line.precioTotalSinImpuesto));

  if (line.impuestos && line.impuestos.length > 0) {
    const taxes = node.ele("impuestos");
    for (const tax of line.impuestos) {
      appendTaxNode(taxes, tax);
    }
    taxes.up();
  }

  node.up();
}

export class SriInvoiceXmlBuilder {
  build(input: SriInvoiceXmlInput) {
    if (!input.details.length) {
      throw new SriValidationError("La factura debe incluir al menos un detalle");
    }

    if (!input.payments.length) {
      throw new SriValidationError("La factura debe incluir al menos una forma de pago");
    }

    const document = create({ version: "1.0", encoding: "UTF-8" }).ele("comprobante", {
      id: "comprobante",
      version: "1.1.0",
    });

    this.writeInfoTributaria(document, input);
    this.writeInfoFactura(document, input);
    this.writeDetalles(document, input.details);
    this.writeInfoAdicional(document, input.additionalFields);

    return document.end({ prettyPrint: false });
  }

  private writeInfoTributaria(parent: any, input: SriInvoiceXmlInput) {
    const infoTributaria = parent.ele("infoTributaria");
    const company = input.company;

    appendTextNode(infoTributaria, "ambiente", input.environmentCode);
    appendTextNode(infoTributaria, "tipoEmision", input.emissionType ?? "1");
    appendTextNode(infoTributaria, "razonSocial", company.razonSocial);
    appendTextNode(infoTributaria, "nombreComercial", company.nombreComercial);
    appendTextNode(infoTributaria, "ruc", company.ruc);
    appendTextNode(infoTributaria, "claveAcceso", input.accessKey);
    appendTextNode(infoTributaria, "codDoc", input.documentCode ?? "01");
    appendTextNode(infoTributaria, "estab", input.establishment);
    appendTextNode(infoTributaria, "ptoEmi", input.emissionPoint);
    appendTextNode(infoTributaria, "secuencial", input.sequential);
    appendTextNode(infoTributaria, "dirMatriz", company.dirMatriz);
    appendTextNode(infoTributaria, "contribuyenteEspecial", company.contribuyenteEspecial);
    appendTextNode(infoTributaria, "obligadoContabilidad", company.obligadoContabilidad === undefined ? undefined : yesNo(company.obligadoContabilidad));
    infoTributaria.up();
  }

  private writeInfoFactura(parent: any, input: SriInvoiceXmlInput) {
    const infoFactura = parent.ele("infoFactura");
    const buyer = input.buyer;
    const company = input.company;
    const totals = input.totals;

    appendTextNode(infoFactura, "fechaEmision", formatSriDate(input.issueDate));
    appendTextNode(infoFactura, "dirEstablecimiento", company.direccionEstablecimiento ?? company.dirMatriz);
    appendTextNode(infoFactura, "obligadoContabilidad", company.obligadoContabilidad === undefined ? undefined : yesNo(company.obligadoContabilidad));
    appendTextNode(infoFactura, "tipoIdentificacionComprador", identificationType(buyer.identificacion, buyer.tipoIdentificacion));
    appendTextNode(infoFactura, "razonSocialComprador", buyer.razonSocial);
    appendTextNode(infoFactura, "identificacionComprador", buyer.identificacion);
    appendTextNode(infoFactura, "direccionComprador", buyer.direccion);
    appendTextNode(infoFactura, "telefonoComprador", buyer.telefono);
    appendTextNode(infoFactura, "emailComprador", buyer.email);
    appendTextNode(infoFactura, "totalSinImpuestos", formatDecimal(totals.totalSinImpuestos));
    appendTextNode(infoFactura, "totalDescuento", formatDecimal(totals.totalDescuento));

    const totalConImpuestos = infoFactura.ele("totalConImpuestos");
    for (const tax of totals.totalConImpuestos) {
      const totalImpuesto = totalConImpuestos.ele("totalImpuesto");
      appendTextNode(totalImpuesto, "codigo", tax.codigo);
      appendTextNode(totalImpuesto, "codigoPorcentaje", tax.codigoPorcentaje);
      appendTextNode(totalImpuesto, "baseImponible", formatDecimal(tax.baseImponible));
      appendTextNode(totalImpuesto, "valor", formatDecimal(tax.valor));
      totalImpuesto.up();
    }
    totalConImpuestos.up();

    appendTextNode(infoFactura, "propina", formatDecimal(totals.propina));
    appendTextNode(infoFactura, "importeTotal", formatDecimal(totals.importeTotal));
    appendTextNode(infoFactura, "moneda", totals.moneda ?? "USD");

    const pagos = infoFactura.ele("pagos");
    for (const payment of input.payments) {
      appendPaymentNode(pagos, payment);
    }
    pagos.up();

    infoFactura.up();
  }

  private writeDetalles(parent: any, details: SriInvoiceLine[]) {
    const node = parent.ele("detalles");

    for (const detail of details) {
      appendLineNode(node, detail);
    }

    node.up();
  }

  private writeInfoAdicional(parent: any, additionalFields?: SriInvoiceXmlInput["additionalFields"]) {
    if (!additionalFields || additionalFields.length === 0) return;

    const node = parent.ele("infoAdicional");
    for (const field of additionalFields) {
      node.ele("campoAdicional", { nombre: field.nombre }).txt(field.valor).up();
    }
    node.up();
  }
}