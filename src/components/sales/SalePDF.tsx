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
  },
  company: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: "#2563eb",
  },
  subtitle: {
    fontSize: 10,
    color: "#6b7280",
    marginTop: 2,
  },
  invoiceTitle: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: "#1f2937",
  },
  invoiceNumber: {
    fontSize: 12,
    color: "#2563eb",
    marginTop: 2,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#6b7280",
    textTransform: "uppercase",
    marginBottom: 6,
    letterSpacing: 1,
  },
  infoRow: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 16,
  },
  infoBox: {
    flex: 1,
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 6,
  },
  infoLabel: {
    fontSize: 8,
    color: "#9ca3af",
    marginBottom: 3,
    textTransform: "uppercase",
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
  table: {
    marginBottom: 20,
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
    marginTop: 8,
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
  footer: {
    marginTop: 40,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 16,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: {
    fontSize: 8,
    color: "#9ca3af",
  },
});

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
};

export function SalePDF({ sale }: SalePDFProps) {
  const date = new Date(sale.createdAt).toLocaleDateString("es-EC", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.company}>StockFlow</Text>
            <Text style={styles.subtitle}>Sistema de inventario y ventas</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.invoiceTitle}>FACTURA</Text>
            <Text style={styles.invoiceNumber}>{sale.number}</Text>
            <Text style={[styles.subtitle, { marginTop: 4 }]}>{date}</Text>
          </View>
        </View>

        {/* Info */}
        <View style={styles.infoRow}>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Cliente</Text>
            <Text style={styles.infoValue}>
              {sale.customer?.name ?? "Consumidor final"}
            </Text>
            {sale.customer?.ruc && (
              <Text style={styles.infoSub}>RUC: {sale.customer.ruc}</Text>
            )}
            {sale.customer?.phone && (
              <Text style={styles.infoSub}>{sale.customer.phone}</Text>
            )}
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Vendedor</Text>
            <Text style={styles.infoValue}>{sale.seller.name}</Text>
          </View>
        </View>

        {/* Tabla productos */}
        <View style={styles.table}>
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
          <View style={{ marginTop: 20 }}>
            <Text style={styles.sectionTitle}>Notas</Text>
            <Text style={{ fontSize: 10, color: "#6b7280" }}>{sale.notes}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>StockFlow — Sistema de inventario y ventas</Text>
          <Text style={styles.footerText}>{sale.number} • {date}</Text>
        </View>
      </Page>
    </Document>
  );
}