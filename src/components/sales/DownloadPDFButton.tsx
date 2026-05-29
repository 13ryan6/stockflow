"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";
import { SalePDF } from "./SalePDF";
import { Button } from "@/components/ui/button";
import { FileText, Loader2 } from "lucide-react";

export function DownloadPDFButton({ sale, business }: { sale: any; business: any }) {
  return (
    <PDFDownloadLink
      document={<SalePDF sale={sale} business={business} />}
      fileName={`${sale.number}.pdf`}
    >
      {({ loading }) => (
        <Button className="bg-blue-600 hover:bg-blue-700" disabled={loading}>
          {loading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generando...</>
          ) : (
            <><FileText className="mr-2 h-4 w-4" />Descargar PDF</>
          )}
        </Button>
      )}
    </PDFDownloadLink>
  );
}