import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#1f2937",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#2563eb",
  },
  company: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: "#2563eb",
  },
  companyInfo: {
    fontSize: 9,
    color: "#6b7280",
    marginTop: 2,
  },
  invoiceTitle: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: "#1f2937",
    textAlign: "right",
  },
  invoiceNumber: {
    fontSize: 12,
    color: "#2563eb",
    marginTop: 2,
    textAlign: "right",
  },
  invoiceDate: {
    fontSize: 9,
    color: "#6b7280",
    marginTop: 4,
    textAlign: "right",
  },
  infoRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 20,
  },
  infoBox: {
    flex: 1,
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: "#2563eb",
  },
  infoLabel: {
    fontSize: 8,
    color: "#9ca3af",
    marginBottom: 4,
    textTransform: "uppercase",
    fontFamily: "Helvetica-Bold",
  },
  infoValue: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#1f2937",
  },
  infoSub: {
    fontSize: 9,
    color: "#6b7280",
    marginTop: 2,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#1e293b",
    padding: "8 12",
    borderRadius: 4,
    marginBottom: 2,
  },
  tableHeaderText: {
    color: "#ffffff",
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    padding: "8 12",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  tableRowAlt: {
    flexDirection: "row",
    padding: "8 12",
    backgroundColor: "#f9fafb",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  col1: { flex: 3 },
  col2: { flex: 1, textAlign: "right" },
  col3: { flex: 1, textAlign: "right" },
  col4: { flex: 1, textAlign: "right" },
  totals: {
    alignItems: "flex-end",
    marginTop: 12,
    marginBottom: 20,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 40,
    marginBottom: 4,
  },
  totalLabel: {
    fontSize: 10,
    color: "#6b7280",
    width: 80,
    textAlign: "right",
  },
  totalValue: {
    fontSize: 10,
    color: "#1f2937",
    width: 70,
    textAlign: "right",
  },
  totalFinalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 40,
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 2,
    borderTopColor: "#2563eb",
  },
  totalFinalLabel: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: "#1f2937",
    width: 80,
    textAlign: "right",
  },
  totalFinalValue: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: "#2563eb",
    width: 70,
    textAlign: "right",
  },
  thanksBox: {
    backgroundColor: "#eff6ff",
    borderRadius: 6,
    padding: 12,
    alignItems: "center",
    marginTop: 20,
  },
  thanksText: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#2563eb",
  },
  thanksSub: {
    fontSize: 9,
    color: "#6b7280",
    marginTop: 4,
  },
  footer: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: {
    fontSize: 8,
    color: "#9ca3af",
  },
});

type BusinessConfig = {
  name: string;
  ruc: string | null;
  phone: string | null;
  address: string | null;
  email: string | null;
} | null;

type SalePDFProps = {
  sale: {
    number: string;
    createdAt: Date;
    subtotal: any;
    tax: any;
    total: any;
    notes: string | null;
    customer: {
      name: string;
      email: string | null;
      phone: string | null;
      ruc: string | null;
      address: string | null;
    } | null;
    seller: { name: string };
    items: {
      id: string;
      quantity: number;
      price: any;
      subtotal: any;
      product: { name: string };
    }[];
  };
  business: BusinessConfig;
};

export function SalePDF({ sale, business }: SalePDFProps) {
  const date = new Date(sale.createdAt).toLocaleDateString("es-EC", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const time = new Date(sale.createdAt).toLocaleTimeString("es-EC", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.company}>{business?.name ?? "StockFlow"}</Text>
            {business?.ruc && <Text style={styles.companyInfo}>RUC: {business.ruc}</Text>}
            {business?.phone && <Text style={styles.companyInfo}>Tel: {business.phone}</Text>}
            {business?.address && <Text style={styles.companyInfo}>{business.address}</Text>}
            {business?.email && <Text style={styles.companyInfo}>{business.email}</Text>}
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.invoiceTitle}>FACTURA</Text>
            <Text style={styles.invoiceNumber}>{sale.number}</Text>
            <Text style={styles.invoiceDate}>{date}</Text>
            <Text style={styles.invoiceDate}>{time}</Text>
          </View>
        </View>

        {/* Cliente y Vendedor */}
        <View style={styles.infoRow}>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Cliente</Text>
            <Text style={styles.infoValue}>
              {sale.customer?.name ?? "Consumidor final"}
            </Text>
            {sale.customer?.ruc && (
              <Text style={styles.infoSub}>RUC / CI: {sale.customer.ruc}</Text>
            )}
            {sale.customer?.phone && (
              <Text style={styles.infoSub}>Tel: {sale.customer.phone}</Text>
            )}
            {sale.customer?.address && (
              <Text style={styles.infoSub}>{sale.customer.address}</Text>
            )}
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Vendedor</Text>
            <Text style={styles.infoValue}>{sale.seller.name}</Text>
            <Text style={styles.infoSub}>Método de pago: Efectivo</Text>
          </View>
        </View>

        {/* Tabla productos */}
        <View>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.col1]}>Producto</Text>
            <Text style={[styles.tableHeaderText, styles.col2]}>Precio</Text>
            <Text style={[styles.tableHeaderText, styles.col3]}>Cant.</Text>
            <Text style={[styles.tableHeaderText, styles.col4]}>Subtotal</Text>
          </View>
          {sale.items.map((item, index) => (
            <View key={item.id} style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
              <Text style={[{ fontSize: 10 }, styles.col1]}>{item.product.name}</Text>
              <Text style={[{ fontSize: 10 }, styles.col2]}>${Number(item.price).toFixed(2)}</Text>
              <Text style={[{ fontSize: 10 }, styles.col3]}>{item.quantity}</Text>
              <Text style={[{ fontSize: 10 }, styles.col4]}>${Number(item.subtotal).toFixed(2)}</Text>
            </View>
          ))}
        </View>

        {/* Totales */}
        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>${Number(sale.subtotal).toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>IVA (15%)</Text>
            <Text style={styles.totalValue}>${Number(sale.tax).toFixed(2)}</Text>
          </View>
          <View style={styles.totalFinalRow}>
            <Text style={styles.totalFinalLabel}>TOTAL</Text>
            <Text style={styles.totalFinalValue}>${Number(sale.total).toFixed(2)}</Text>
          </View>
        </View>

        {/* Notas */}
        {sale.notes && (
          <View style={{ marginTop: 12 }}>
            <Text style={{ fontSize: 9, color: "#6b7280", fontFamily: "Helvetica-Bold" }}>NOTAS</Text>
            <Text style={{ fontSize: 10, color: "#6b7280", marginTop: 4 }}>{sale.notes}</Text>
          </View>
        )}

        {/* Gracias */}
        <View style={styles.thanksBox}>
          <Text style={styles.thanksText}>¡Gracias por su compra!</Text>
          <Text style={styles.thanksSub}>Vuelva pronto — {business?.name ?? "StockFlow"}</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>{business?.name ?? "StockFlow"} — {business?.address ?? ""}</Text>
          <Text style={styles.footerText}>{sale.number} • {date}</Text>
        </View>

      </Page>
    </Document>
  );
}