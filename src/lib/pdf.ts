// ----------------------------------------------------------------------------
// PDF generation helpers — jsPDF + autoTable. Used for receipts, dispatch
// checklists, admin orders list, and customer statements.
//
// All helpers run fully client-side: no server roundtrip, no extra runtime
// fonts. Documents share a tiny header so the brand feels consistent.
// ----------------------------------------------------------------------------

import { jsPDF } from "jspdf";
import autoTable, { type RowInput } from "jspdf-autotable";

const BRAND = {
  name: "Moments Packaging",
  email: "info@momentspackaging.com",
  phone: "+254 119 556 688",
  site: "www.momentspackaging.com",
};

const KES = new Intl.NumberFormat("en-KE", {
  style: "currency",
  currency: "KES",
  maximumFractionDigits: 0,
});
const fmt = (n: number | null | undefined) => KES.format(Number(n ?? 0));

function brandHeader(doc: jsPDF, title: string, subtitle?: string) {
  const pageW = doc.internal.pageSize.getWidth();
  doc.setFillColor(20, 20, 20);
  doc.rect(0, 0, pageW, 32, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(BRAND.name, 14, 14);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`${BRAND.email}  ·  ${BRAND.phone}`, 14, 21);
  doc.text(BRAND.site, 14, 26.5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(title.toUpperCase(), pageW - 14, 14, { align: "right" });
  if (subtitle) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(subtitle, pageW - 14, 21, { align: "right" });
  }
  doc.setTextColor(20, 20, 20);
}

function footer(doc: jsPDF) {
  const pageH = doc.internal.pageSize.getHeight();
  const pageW = doc.internal.pageSize.getWidth();
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(
      `${BRAND.name} · Generated ${new Date().toLocaleString("en-KE")}`,
      14,
      pageH - 8,
    );
    doc.text(`Page ${i} / ${total}`, pageW - 14, pageH - 8, { align: "right" });
  }
}

function save(doc: jsPDF, filename: string) {
  footer(doc);
  doc.save(filename);
}

// ----------------------------------------------------------------------------
// 1. Customer order receipt / invoice
// ----------------------------------------------------------------------------

interface ReceiptItem {
  productName: string;
  size?: string | null;
  material?: string | null;
  finish?: string | null;
  sku?: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

interface ReceiptOrder {
  reference: string;
  createdAt: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  city: string;
  county?: string | null;
  currency?: string;
  subtotal: number;
  shippingFee: number;
  vatAmount?: number | null;
  total: number;
  paymentMethod?: string;
  paymentStatus?: string;
  paymentReference?: string | null;
  receiptNumber?: string | null;
  fulfillmentType?: string | null;
  items: ReceiptItem[];
}

export function downloadReceiptPdf(order: ReceiptOrder) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  brandHeader(doc, "Receipt", order.reference);

  let y = 42;
  doc.setFontSize(9);
  doc.setTextColor(110, 110, 110);
  doc.text("BILLED TO", 14, y);
  doc.text("SHIP TO", 110, y);
  y += 5;
  doc.setTextColor(20, 20, 20);
  doc.setFont("helvetica", "bold");
  doc.text(order.customerName, 14, y);
  doc.setFont("helvetica", "normal");
  doc.text(order.shippingAddress || "—", 110, y);
  y += 5;
  doc.text(order.customerEmail, 14, y);
  doc.text([order.city, order.county].filter(Boolean).join(", "), 110, y);
  y += 5;
  doc.text(order.customerPhone, 14, y);
  y += 5;
  doc.setFontSize(9);
  doc.setTextColor(110, 110, 110);
  doc.text(`Placed ${new Date(order.createdAt).toLocaleString("en-KE")}`, 14, y);

  autoTable(doc, {
    startY: y + 6,
    head: [["Item", "Qty", "Unit", "Total"]],
    body: order.items.map((it) => [
      `${it.productName}${
        [it.size, it.material, it.finish].filter(Boolean).length
          ? `\n${[it.size, it.material, it.finish].filter(Boolean).join(" · ")}`
          : ""
      }${it.sku ? `\nSKU ${it.sku}` : ""}`,
      it.quantity.toLocaleString("en-KE"),
      fmt(it.unitPrice),
      fmt(it.lineTotal),
    ]) as RowInput[],
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [20, 20, 20], textColor: 255 },
    columnStyles: {
      1: { halign: "right", cellWidth: 18 },
      2: { halign: "right", cellWidth: 28 },
      3: { halign: "right", cellWidth: 32, fontStyle: "bold" },
    },
    margin: { left: 14, right: 14 },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const endY = (doc as any).lastAutoTable?.finalY ?? y + 30;
  const pageW = doc.internal.pageSize.getWidth();
  const labelX = pageW - 70;
  const valueX = pageW - 14;
  let ty = endY + 8;
  doc.setFontSize(10);
  doc.text("Subtotal", labelX, ty);
  doc.text(fmt(order.subtotal), valueX, ty, { align: "right" });
  ty += 6;
  doc.text("Delivery", labelX, ty);
  const isCourier = order.fulfillmentType === "OWN_COURIER";
  const deliveryValue = isCourier
    ? "To be confirmed"
    : order.shippingFee === 0
      ? "Free"
      : fmt(order.shippingFee);
  doc.text(deliveryValue, valueX, ty, { align: "right" });
  ty += 6;
  const vat = Number(order.vatAmount ?? 0);
  if (vat > 0) {
    doc.text("VAT (16%)", labelX, ty);
    doc.text(fmt(vat), valueX, ty, { align: "right" });
    ty += 6;
  }
  ty += 1;
  doc.setDrawColor(20, 20, 20);
  doc.line(labelX, ty - 3, valueX, ty - 3);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(`TOTAL (${order.currency ?? "KES"})`, labelX, ty + 2);
  doc.text(fmt(order.total), valueX, ty + 2, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(110, 110, 110);
  let fy = ty + 16;
  doc.text(
    `Payment: ${order.paymentMethod ?? "—"}${order.paymentStatus ? ` · ${order.paymentStatus}` : ""}`,
    14,
    fy,
  );
  const mpesa = order.receiptNumber ?? order.paymentReference;
  if (mpesa) {
    fy += 5;
    doc.text(`M-Pesa receipt: ${mpesa}`, 14, fy);
  }
  fy += 10;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(20, 20, 20);
  doc.text("Thank you for your business — momentspackaging.com", 14, fy);

  save(doc, `receipt-${order.reference}.pdf`);
}

// ----------------------------------------------------------------------------
// 2. Admin dispatch checklist (physical, packer-friendly with tick boxes)
// ----------------------------------------------------------------------------

interface DispatchOrderLike {
  reference: string;
  customerName: string;
  customerPhone?: string | null;
  city?: string | null;
  shippingAddress?: string | null;
  trackingNumber?: string | null;
  items: { name: string; size?: string | null; material?: string | null; qty: number; lineTotal?: number | null }[];
}

export function downloadDispatchChecklistPdf(order: DispatchOrderLike) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  brandHeader(doc, "Dispatch checklist", order.reference);

  let y = 42;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(order.customerName, 14, y);
  doc.setFont("helvetica", "normal");
  y += 5;
  doc.text(`${order.customerPhone ?? ""}`, 14, y);
  y += 5;
  doc.text(`${[order.shippingAddress, order.city].filter(Boolean).join(", ") || "—"}`, 14, y);
  if (order.trackingNumber) {
    y += 5;
    doc.text(`Tracking: ${order.trackingNumber}`, 14, y);
  }

  autoTable(doc, {
    startY: y + 6,
    head: [["✓", "Item", "Spec", "Qty", "Line total"]],
    body: order.items.map((it) => [
      "",
      it.name,
      [it.size, it.material].filter(Boolean).join(" · ") || "—",
      String(it.qty),
      it.lineTotal != null ? fmt(it.lineTotal) : "—",
    ]) as RowInput[],
    styles: { fontSize: 10, cellPadding: 4, valign: "middle" },
    headStyles: { fillColor: [20, 20, 20], textColor: 255 },
    columnStyles: {
      0: { cellWidth: 12, halign: "center" },
      3: { halign: "right", cellWidth: 18, fontStyle: "bold" },
      4: { halign: "right", cellWidth: 32 },
    },
    didDrawCell: (data) => {
      // Draw a real tick box in column 0 of body rows
      if (data.section === "body" && data.column.index === 0) {
        const size = 5;
        const x = data.cell.x + (data.cell.width - size) / 2;
        const cy = data.cell.y + (data.cell.height - size) / 2;
        doc.setDrawColor(20, 20, 20);
        doc.setLineWidth(0.4);
        doc.rect(x, cy, size, size);
      }
    },
    margin: { left: 14, right: 14 },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const endY = (doc as any).lastAutoTable?.finalY ?? y + 30;
  let ty = endY + 12;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Packed by", 14, ty);
  doc.text("Date", 80, ty);
  doc.text("Signature", 130, ty);
  doc.setLineWidth(0.3);
  doc.line(14, ty + 14, 70, ty + 14);
  doc.line(80, ty + 14, 120, ty + 14);
  doc.line(130, ty + 14, 190, ty + 14);

  ty += 26;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(110, 110, 110);
  doc.text(
    "Tick every item before sealing the parcel. Keep this slip with the dispatch records for 30 days.",
    14,
    ty,
  );

  save(doc, `dispatch-${order.reference}.pdf`);
}

// ----------------------------------------------------------------------------
// 3. Admin orders list (filtered)
// ----------------------------------------------------------------------------

interface OrdersListRow {
  reference: string;
  customerName: string;
  city?: string | null;
  status: string;
  paymentStatus: string;
  total: number;
  createdAt: string;
  items: { qty: number }[];
}

export function downloadOrdersListPdf(
  rows: OrdersListRow[],
  meta: { filterLabel?: string } = {},
) {
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "landscape" });
  brandHeader(doc, "Orders report", meta.filterLabel ?? "All statuses");

  const revenue = rows.reduce((s, o) => s + Number(o.total ?? 0), 0);
  const units = rows.reduce(
    (s, o) => s + o.items.reduce((u, it) => u + Number(it.qty ?? 0), 0),
    0,
  );

  doc.setFontSize(10);
  doc.text(
    `${rows.length} orders  ·  ${units.toLocaleString("en-KE")} units  ·  Revenue ${fmt(revenue)}`,
    14,
    40,
  );

  autoTable(doc, {
    startY: 46,
    head: [["Reference", "Customer", "City", "Units", "Status", "Payment", "Total", "Created"]],
    body: rows.map((o) => [
      o.reference,
      o.customerName,
      o.city ?? "—",
      String(o.items.reduce((s, it) => s + Number(it.qty ?? 0), 0)),
      o.status.replace(/_/g, " "),
      o.paymentStatus,
      fmt(o.total),
      new Date(o.createdAt).toLocaleDateString("en-KE"),
    ]) as RowInput[],
    styles: { fontSize: 9, cellPadding: 2.5 },
    headStyles: { fillColor: [20, 20, 20], textColor: 255 },
    columnStyles: {
      3: { halign: "right" },
      6: { halign: "right", fontStyle: "bold" },
    },
    margin: { left: 14, right: 14 },
  });

  save(doc, `orders-${new Date().toISOString().slice(0, 10)}.pdf`);
}

// ----------------------------------------------------------------------------
// 4. Customer statement / order history
// ----------------------------------------------------------------------------

interface StatementCustomer {
  name: string;
  email: string;
  phone?: string | null;
  city?: string | null;
  lifetimeValue?: number | null;
  ordersCount?: number | null;
  averageOrderValue?: number | null;
  firstOrderAt?: string | null;
  lastOrderAt?: string | null;
}

export function downloadCustomerStatementPdf(
  customer: StatementCustomer,
  orders: OrdersListRow[],
) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  brandHeader(doc, "Customer statement", customer.name);

  let y = 42;
  doc.setFontSize(10);
  doc.text(`${customer.email}${customer.phone ? `  ·  ${customer.phone}` : ""}`, 14, y);
  y += 5;
  if (customer.city) {
    doc.text(customer.city, 14, y);
    y += 5;
  }

  // Summary box
  y += 3;
  doc.setDrawColor(220, 220, 220);
  doc.setFillColor(248, 246, 240);
  doc.roundedRect(14, y, 180, 26, 2, 2, "FD");
  doc.setFontSize(9);
  doc.setTextColor(110, 110, 110);
  doc.text("LIFETIME VALUE", 20, y + 7);
  doc.text("ORDERS", 80, y + 7);
  doc.text("AVERAGE ORDER", 130, y + 7);
  doc.setTextColor(20, 20, 20);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(fmt(customer.lifetimeValue ?? 0), 20, y + 17);
  doc.text(String(customer.ordersCount ?? orders.length), 80, y + 17);
  doc.text(fmt(customer.averageOrderValue ?? 0), 130, y + 17);
  doc.setFont("helvetica", "normal");

  autoTable(doc, {
    startY: y + 34,
    head: [["Reference", "Date", "Units", "Status", "Payment", "Total"]],
    body: orders.map((o) => [
      o.reference,
      new Date(o.createdAt).toLocaleDateString("en-KE"),
      String(o.items.reduce((s, it) => s + Number(it.qty ?? 0), 0)),
      o.status.replace(/_/g, " "),
      o.paymentStatus,
      fmt(o.total),
    ]) as RowInput[],
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [20, 20, 20], textColor: 255 },
    columnStyles: {
      2: { halign: "right" },
      5: { halign: "right", fontStyle: "bold" },
    },
    margin: { left: 14, right: 14 },
  });

  save(doc, `statement-${customer.name.replace(/\s+/g, "-").toLowerCase()}.pdf`);
}
