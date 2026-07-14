import { XMLParser } from "fast-xml-parser";
import { SriSoapError } from "./errors";
import type { SriAuthorizationResult, SriEnvironmentUrls, SriReceptionResult } from "./types";
import type { SriMessageDetail } from "./errors";

function normalizeArray<T>(value: T | T[] | undefined | null): T[] {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function extractSoapBody(xml: string) {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    removeNSPrefix: true,
    trimValues: true,
  });

  return parser.parse(xml);
}

function extractMessages(node: any): SriMessageDetail[] {
  const mensajes = normalizeArray(node?.mensajes?.mensaje ?? node?.mensaje);

  return mensajes.map((mensaje: any) => ({
    identificador: mensaje?.identificador ?? mensaje?.codigo ?? mensaje?.id,
    mensaje: mensaje?.mensaje ?? mensaje?.descripcion ?? mensaje?.detalle ?? "",
    informacionAdicional: mensaje?.informacionAdicional ?? mensaje?.adicional,
    tipo: mensaje?.tipo,
  }));
}

async function postSoap(endpoint: string, namespace: string, operation: string, body: string) {
  const envelope = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="${namespace}">
  <soapenv:Header/>
  <soapenv:Body>
    <ns:${operation}>
      ${body}
    </ns:${operation}>
  </soapenv:Body>
</soapenv:Envelope>`;

  let response: Response;

  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        SOAPAction: "",
      },
      body: envelope,
    });
  } catch (error) {
    throw new SriSoapError("No fue posible consumir el servicio SOAP del SRI", { error, endpoint, operation });
  }

  const responseText = await response.text();

  if (!response.ok) {
    throw new SriSoapError("El servicio SOAP del SRI respondió con error HTTP", {
      endpoint,
      operation,
      status: response.status,
      responseText,
    });
  }

  return { responseText, parsed: extractSoapBody(responseText) };
}

function getBodyNode(parsed: any) {
  return parsed?.Envelope?.Body ?? parsed?.Body ?? parsed;
}

export class SriSoapClient {
  constructor(private readonly urls: SriEnvironmentUrls) {}

  async sendSignedXmlBase64(signedXmlBase64: string): Promise<SriReceptionResult> {
    const { responseText, parsed } = await postSoap(
      this.urls.reception,
      "http://ec.gob.sri.ws.recepcion",
      "validarComprobante",
      `<xml>${escapeXml(signedXmlBase64)}</xml>`,
    );

    const body = getBodyNode(parsed);
    const responseNode = body?.RespuestaSolicitud ?? body?.respuestaSolicitud ?? body;
    const messages = normalizeArray(responseNode?.comprobantes?.comprobante).flatMap((comprobante: any) => extractMessages(comprobante));

    return {
      estado: responseNode?.estado ?? "",
      messages,
      raw: parsed,
      rawXml: responseText,
    };
  }

  async authorizeByAccessKey(accessKey: string): Promise<SriAuthorizationResult> {
    const { responseText, parsed } = await postSoap(
      this.urls.authorization,
      "http://ec.gob.sri.ws.autorizacion",
      "autorizacionComprobante",
      `<claveAccesoComprobante>${escapeXml(accessKey)}</claveAccesoComprobante>`,
    );

    const body = getBodyNode(parsed);
    const responseNode = body?.RespuestaAutorizacionComprobante ?? body?.respuestaAutorizacionComprobante ?? body?.RespuestaAutorizacion ?? body;
    const autorizaciones = normalizeArray(responseNode?.autorizaciones?.autorizacion);
    const selectedAuthorization = autorizaciones[0] ?? {};
    const messages = extractMessages(selectedAuthorization);

    return {
      estado: selectedAuthorization?.estado ?? responseNode?.estado ?? "",
      numeroAutorizacion: selectedAuthorization?.numeroAutorizacion,
      fechaAutorizacion: selectedAuthorization?.fechaAutorizacion,
      ambiente: selectedAuthorization?.ambiente,
      comprobante: selectedAuthorization?.comprobante,
      messages,
      raw: parsed,
      rawXml: responseText,
    };
  }
}