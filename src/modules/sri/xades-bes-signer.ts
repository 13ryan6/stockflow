import { createHash, randomUUID } from "crypto";
import { readFile } from "fs/promises";
import * as forge from "node-forge";
import { DOMParser } from "@xmldom/xmldom";
import { SignedXml } from "xml-crypto";
import { SriSignatureError } from "./errors";

interface LoadedP12Credentials {
  privateKeyPem: string;
  certificatePem: string;
  certificateDer: Buffer;
  issuerName: string;
  serialNumber: string;
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toDecimalSerial(hexSerial: string) {
  return BigInt(`0x${hexSerial}`).toString(10);
}

function formatIssuerName(cert: forge.pki.Certificate) {
  return cert.issuer.attributes
    .map((attribute) => `${attribute.shortName ?? attribute.name ?? attribute.type}=${attribute.value}`)
    .join(", ");
}

async function loadP12Credentials(p12Path: string, password: string): Promise<LoadedP12Credentials> {
  const p12Buffer = await readFile(p12Path);

  try {
    const asn1 = forge.asn1.fromDer(p12Buffer.toString("binary"));
    const p12 = forge.pkcs12.pkcs12FromAsn1(asn1, password);

    const certificateBag = p12.getBags({ bagType: forge.pki.oids.certBag })[forge.pki.oids.certBag]?.[0];
    const privateKeyBag =
      p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag })[forge.pki.oids.pkcs8ShroudedKeyBag]?.[0] ??
      p12.getBags({ bagType: forge.pki.oids.keyBag })[forge.pki.oids.keyBag]?.[0];

    if (!certificateBag?.cert || !privateKeyBag?.key) {
      throw new SriSignatureError("No se pudo extraer el certificado o la clave privada del archivo .p12");
    }

    const certificate = certificateBag.cert as forge.pki.Certificate;
    const certificateDer = Buffer.from(forge.asn1.toDer(forge.pki.certificateToAsn1(certificate)).getBytes(), "binary");

    return {
      privateKeyPem: forge.pki.privateKeyToPem(privateKeyBag.key as forge.pki.rsa.PrivateKey),
      certificatePem: forge.pki.certificateToPem(certificate),
      certificateDer,
      issuerName: formatIssuerName(certificate),
      serialNumber: toDecimalSerial(certificate.serialNumber),
    };
  } catch (error) {
    throw new SriSignatureError("No fue posible abrir el archivo .p12", { error });
  }
}

export interface SriXadesSignInput {
  xml: string;
  p12Path: string;
  password: string;
}

function cryptoRandomId() {
  return randomUUID().replace(/-/g, "").slice(0, 16);
}

export class SriXadesBesSigner {
  async sign({ xml, p12Path, password }: SriXadesSignInput) {
    const credentials = await loadP12Credentials(p12Path, password);
    const signatureId = `Signature-${cryptoRandomId()}`;
    const signedPropertiesId = `SignedProperties-${cryptoRandomId()}`;
    const objectId = `XadesObject-${cryptoRandomId()}`;
    const signingTime = new Date().toISOString();
    const certificateDigest = createHash("sha256").update(credentials.certificateDer).digest("base64");

    const xadesObject = `
      <xades:QualifyingProperties xmlns:xades="http://uri.etsi.org/01903/v1.3.2#" Target="#${signatureId}">
        <xades:SignedProperties Id="${signedPropertiesId}">
          <xades:SignedSignatureProperties>
            <xades:SigningTime>${signingTime}</xades:SigningTime>
            <xades:SigningCertificate>
              <xades:Cert>
                <xades:CertDigest>
                  <ds:DigestMethod Algorithm="http://www.w3.org/2001/04/xmlenc#sha256" />
                  <ds:DigestValue>${certificateDigest}</ds:DigestValue>
                </xades:CertDigest>
                <xades:IssuerSerial>
                  <ds:X509IssuerName>${escapeXml(credentials.issuerName)}</ds:X509IssuerName>
                  <ds:X509SerialNumber>${credentials.serialNumber}</ds:X509SerialNumber>
                </xades:IssuerSerial>
              </xades:Cert>
            </xades:SigningCertificate>
          </xades:SignedSignatureProperties>
        </xades:SignedProperties>
      </xades:QualifyingProperties>
    `.trim();

    try {
      const signer = new SignedXml({
        privateKey: credentials.privateKeyPem,
        publicCert: credentials.certificatePem,
        canonicalizationAlgorithm: "http://www.w3.org/2001/10/xml-exc-c14n#",
        signatureAlgorithm: "http://www.w3.org/2001/04/xmldsig-more#rsa-sha256",
        objects: [
          {
            content: xadesObject,
            attributes: {
              Id: objectId,
              MimeType: "text/xml",
              Encoding: "UTF-8",
            },
          },
        ],
      } as any);

      signer.addReference({
        xpath: "/*[local-name(.)='comprobante']",
        transforms: ["http://www.w3.org/2000/09/xmldsig#enveloped-signature", "http://www.w3.org/2001/10/xml-exc-c14n#"],
        digestAlgorithm: "http://www.w3.org/2001/04/xmlenc#sha256",
      });

      signer.addReference({
        xpath: `//*[@Id='${signedPropertiesId}']`,
        transforms: ["http://www.w3.org/2001/10/xml-exc-c14n#"],
        digestAlgorithm: "http://www.w3.org/2001/04/xmlenc#sha256",
        type: "http://uri.etsi.org/01903#SignedProperties",
      } as any);

      signer.computeSignature(xml, {
        prefix: "ds",
        attrs: {
          Id: signatureId,
        },
        location: {
          reference: "/*[local-name(.)='comprobante']",
          action: "append",
        },
      });

      const signedXml = signer.getSignedXml();

      if (!signedXml) {
        throw new SriSignatureError("La firma digital no generó un XML firmado");
      }

      const parser = new DOMParser();
      const document = parser.parseFromString(signedXml, "text/xml");

      if (!document || document.getElementsByTagName("parsererror").length > 0) {
        throw new SriSignatureError("El XML firmado no es válido");
      }

      return signedXml;
    } catch (error) {
      if (error instanceof SriSignatureError) {
        throw error;
      }

      throw new SriSignatureError("No fue posible firmar el comprobante", { error });
    }
  }
}