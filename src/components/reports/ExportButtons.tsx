"use client";

import { Button } from "@/components/ui/button";
import { FileDown, FileSpreadsheet } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

type ExportProps = {
  stats: {
    totalToday: number;
    totalWeek: number;
    totalMonth: number;
    totalAll: number;
    salesToday: number;
    salesWeek: number;
    salesMonth: number;
    ivaMonth: number;
    subtotalMonth: number;
    impuestoRenta: number;
  };
  topProducts: { name: string; quantity: number }[];
  topCustomers: { name: string; total: number; count: number }[];
  inventoryValue: number;
  inventoryByCategory: { name: string; value: number }[];
  topValueProducts: { name: string; value: number; stock: number }[];
  outOfStockProducts: { name: string }[];
};

export function ExportButtons(props: ExportProps) {
  const {
    stats,
    topProducts,
    topCustomers,
    inventoryValue,
    inventoryByCategory,
    topValueProducts,
    outOfStockProducts,
  } = props;

  const safeInventoryValue = inventoryValue ?? 0;
  const fecha = new Date().toLocaleDateString("es-EC");

  // ── PDF ──────────────────────────────────────────────────────────────
  function exportPDF() {
    const doc = new jsPDF();
    let y = 15;

    // Título
    doc.setFontSize(18);
    doc.setTextColor(30, 64, 175);
    doc.text("StockFlow — Reporte General", 14, y);
    y += 7;
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generado el ${fecha}`, 14, y);
    y += 10;

    // Ventas
    doc.setFontSize(13);
    doc.setTextColor(30);
    doc.text("Resumen de Ventas", 14, y);
    y += 4;
    autoTable(doc, {
      startY: y,
      head: [["Período", "Ventas", "Monto"]],
      body: [
        ["Hoy", `${stats.salesToday}`, `$${stats.totalToday.toFixed(2)}`],
        ["Esta semana", `${stats.salesWeek}`, `$${stats.totalWeek.toFixed(2)}`],
        ["Este mes", `${stats.salesMonth}`, `$${stats.totalMonth.toFixed(2)}`],
        ["Total histórico", "—", `$${stats.totalAll.toFixed(2)}`],
      ],
      theme: "striped",
      headStyles: { fillColor: [30, 64, 175] },
    });
    y = (doc as any).lastAutoTable.finalY + 10;

    // SRI
    doc.setFontSize(13);
    doc.text("Obligaciones SRI — Este mes", 14, y);
    y += 4;
    autoTable(doc, {
      startY: y,
      head: [["Concepto", "Monto"]],
      body: [
        ["Ingresos brutos", `$${stats.subtotalMonth.toFixed(2)}`],
        ["IVA cobrado (15%)", `$${stats.ivaMonth.toFixed(2)}`],
        ["Impuesto a la Renta estimado (RIMPE 2%)", `$${stats.impuestoRenta.toFixed(2)}`],
      ],
      theme: "striped",
      headStyles: { fillColor: [217, 119, 6] },
    });
    y = (doc as any).lastAutoTable.finalY + 10;

    // Inventario
    doc.setFontSize(13);
    doc.text("Inventario", 14, y);
    y += 4;
    autoTable(doc, {
      startY: y,
      head: [["Concepto", "Valor"]],
      body: [
        ["Valor total del inventario", `$${safeInventoryValue.toFixed(2)}`],
        ...inventoryByCategory.map((c) => [`Categoría: ${c.name}`, `$${c.value.toFixed(2)}`]),
      ],
      theme: "striped",
      headStyles: { fillColor: [13, 148, 136] },
    });
    y = (doc as any).lastAutoTable.finalY + 10;

    // Top productos con mayor valor
    if (topValueProducts.length > 0) {
      doc.setFontSize(13);
      doc.text("Mayor valor inmovilizado", 14, y);
      y += 4;
      autoTable(doc, {
        startY: y,
        head: [["Producto", "Stock", "Valor"]],
        body: topValueProducts.map((p) => [p.name, `${p.stock}`, `$${p.value.toFixed(2)}`]),
        theme: "striped",
        headStyles: { fillColor: [13, 148, 136] },
      });
      y = (doc as any).lastAutoTable.finalY + 10;
    }

    // Productos más vendidos
    if (topProducts.length > 0) {
      doc.setFontSize(13);
      doc.text("Productos más vendidos", 14, y);
      y += 4;
      autoTable(doc, {
        startY: y,
        head: [["Producto", "Unidades vendidas"]],
        body: topProducts.map((p) => [p.name, `${p.quantity}`]),
        theme: "striped",
        headStyles: { fillColor: [37, 99, 235] },
      });
      y = (doc as any).lastAutoTable.finalY + 10;
    }

    // Mejores clientes
    if (topCustomers.length > 0) {
      doc.setFontSize(13);
      doc.text("Mejores clientes", 14, y);
      y += 4;
      autoTable(doc, {
        startY: y,
        head: [["Cliente", "Compras", "Total"]],
        body: topCustomers.map((c) => [c.name, `${c.count}`, `$${c.total.toFixed(2)}`]),
        theme: "striped",
        headStyles: { fillColor: [124, 58, 237] },
      });
    }

    // Productos agotados
    if (outOfStockProducts.length > 0) {
      y = (doc as any).lastAutoTable.finalY + 10;
      doc.setFontSize(13);
      doc.text("Productos agotados", 14, y);
      y += 4;
      autoTable(doc, {
        startY: y,
        head: [["Producto"]],
        body: outOfStockProducts.map((p) => [p.name]),
        theme: "striped",
        headStyles: { fillColor: [220, 38, 38] },
      });
    }

    doc.save(`stockflow-reporte-${fecha}.pdf`);
  }

  // ── EXCEL ─────────────────────────────────────────────────────────────
  function exportExcel() {
    const wb = XLSX.utils.book_new();

    // Hoja 1: Ventas
    const wsVentas = XLSX.utils.aoa_to_sheet([
      ["StockFlow — Reporte de Ventas", "", `Fecha: ${fecha}`],
      [],
      ["Período", "Ventas", "Monto"],
      ["Hoy", stats.salesToday, stats.totalToday],
      ["Esta semana", stats.salesWeek, stats.totalWeek],
      ["Este mes", stats.salesMonth, stats.totalMonth],
      ["Total histórico", "—", stats.totalAll],
    ]);
    XLSX.utils.book_append_sheet(wb, wsVentas, "Ventas");

    // Hoja 2: SRI
    const wsSRI = XLSX.utils.aoa_to_sheet([
      ["Obligaciones SRI — Este mes"],
      [],
      ["Concepto", "Monto"],
      ["Ingresos brutos", stats.subtotalMonth],
      ["IVA cobrado (15%)", stats.ivaMonth],
      ["Impuesto a la Renta estimado (RIMPE 2%)", stats.impuestoRenta],
    ]);
    XLSX.utils.book_append_sheet(wb, wsSRI, "SRI");

    // Hoja 3: Inventario
    const wsInv = XLSX.utils.aoa_to_sheet([
      ["Inventario"],
      [],
      ["Valor total del inventario", safeInventoryValue],
      [],
      ["Valor por categoría"],
      ["Categoría", "Valor"],
      ...inventoryByCategory.map((c) => [c.name, c.value]),
      [],
      ["Mayor valor inmovilizado"],
      ["Producto", "Stock", "Valor"],
      ...topValueProducts.map((p) => [p.name, p.stock, p.value]),
      [],
      ["Productos agotados"],
      ["Producto"],
      ...outOfStockProducts.map((p) => [p.name]),
    ]);
    XLSX.utils.book_append_sheet(wb, wsInv, "Inventario");

    // Hoja 4: Productos más vendidos
    const wsProd = XLSX.utils.aoa_to_sheet([
      ["Productos más vendidos"],
      [],
      ["Producto", "Unidades vendidas"],
      ...topProducts.map((p) => [p.name, p.quantity]),
    ]);
    XLSX.utils.book_append_sheet(wb, wsProd, "Productos");

    // Hoja 5: Clientes
    const wsClientes = XLSX.utils.aoa_to_sheet([
      ["Mejores clientes"],
      [],
      ["Cliente", "Compras", "Total"],
      ...topCustomers.map((c) => [c.name, c.count, c.total]),
    ]);
    XLSX.utils.book_append_sheet(wb, wsClientes, "Clientes");

    XLSX.writeFile(wb, `stockflow-reporte-${fecha}.xlsx`);
  }

  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={exportPDF} className="flex items-center gap-2">
        <FileDown className="w-4 h-4 text-red-500" />
        Exportar PDF
      </Button>
      <Button variant="outline" onClick={exportExcel} className="flex items-center gap-2">
        <FileSpreadsheet className="w-4 h-4 text-green-600" />
        Exportar Excel
      </Button>
    </div>
  );
}