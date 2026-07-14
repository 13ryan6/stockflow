import { randomInt } from "crypto";
import { SriAuthorizationRejectedError, SriModuleDisabledError, SriReceptionRejectedError } from "./errors";
import { buildSriAccessKey } from "./access-key";
import { loadSriConfig } from "./config";
import { SriInvoiceXmlBuilder } from "./invoice-xml-builder";
import { SriSoapClient } from "./soap-client";
import { SriXadesBesSigner } from "./xades-bes-signer";
import type { SriInvoiceProcessResult, SriInvoiceXmlInput } from "./types";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class SriElectronicInvoicingService {
  private readonly config = loadSriConfig();
  private readonly builder = new SriInvoiceXmlBuilder();
  private readonly signer = new SriXadesBesSigner();
  private readonly soapClient = new SriSoapClient(this.config.urls);

  async processInvoice(input: Omit<SriInvoiceXmlInput, "environmentCode" | "accessKey"> & { accessKey?: string }): Promise<SriInvoiceProcessResult> {
    if (!this.config.enabled) {
      throw new SriModuleDisabledError();
    }

    const accessKey =
      input.accessKey ??
      buildSriAccessKey({
        issueDate: input.issueDate,
        ruc: input.company.ruc,
        environmentCode: this.config.environmentCode,
        establishment: input.establishment,
        emissionPoint: input.emissionPoint,
        sequential: input.sequential,
        documentCode: input.documentCode,
        emissionType: input.emissionType,
        numericCode: input.numericCode,
      });

    const unsignedXml = this.builder.build({
      ...input,
      environmentCode: this.config.environmentCode,
      accessKey,
    });

    const signedXml = await this.signer.sign({
      xml: unsignedXml,
      p12Path: this.config.certificatePath,
      password: this.config.certificatePassword,
    });

    const signedXmlBase64 = Buffer.from(signedXml, "utf8").toString("base64");
    const reception = await this.soapClient.sendSignedXmlBase64(signedXmlBase64);

    if (reception.estado === "DEVUELTA") {
      throw new SriReceptionRejectedError("El SRI devolvió el comprobante", reception.messages, reception);
    }

    await delay(randomInt(2000, 3001));

    const authorization = await this.soapClient.authorizeByAccessKey(accessKey);

    if (authorization.estado !== "AUTORIZADA") {
      throw new SriAuthorizationRejectedError("El comprobante no fue autorizado por el SRI", authorization.messages, authorization);
    }

    return {
      accessKey,
      unsignedXml,
      signedXml,
      reception,
      authorization,
      environment: this.config.environment,
    };
  }
}