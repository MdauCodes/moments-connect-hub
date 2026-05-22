// ----------------------------------------------------------------------------
// PDF generation — jsPDF + autoTable
//
// Editorial, brand-led layouts shared across receipts, dispatch checklists,
// the admin orders report and customer statements. Every document uses the
// same masthead, accent rule, sectioning grammar and footer so the four PDFs
// feel like one stationery set.
// ----------------------------------------------------------------------------

import { jsPDF } from "jspdf";
import autoTable, { type RowInput } from "jspdf-autotable";

const BRAND = {
  name: "Moments Packaging",
  tagline: "Premium packaging, made in Kenya",
  email: "info@momentspackaging.com",
  phone: "+254 119 556 688",
  site: "momentspackaging.com",
  address: "Nairobi, Kenya",
};

// Ink, paper, accent — sampled from the storefront theme so PDFs feel on-brand.
const INK: [number, number, number] = [18, 18, 20];
const MUTED: [number, number, number] = [110, 110, 116];
const HAIRLINE: [number, number, number] = [225, 222, 215];
const PAPER: [number, number, number] = [250, 248, 243];
const ACCENT: [number, number, number] = [183, 132, 64]; // warm brass

const KES = new Intl.NumberFormat("en-KE", {
  style: "currency",
  currency: "KES",
  maximumFractionDigits: 0,
});
const fmt = (n: number | null | undefined) => KES.format(Number(n ?? 0));
const fmtDate = (d: string | Date) =>
  new Date(d).toLocaleDateString("en-KE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
const fmtDateTime = (d: string | Date) =>
  new Date(d).toLocaleString("en-KE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

// ----------------------------------------------------------------------------
// Shared chrome
// ----------------------------------------------------------------------------

interface MastheadOpts {
  docType: string; // "Receipt", "Dispatch checklist", etc.
  reference?: string;
  issuedAt?: string | Date;
}

function masthead(doc: jsPDF, { docType, reference, issuedAt }: MastheadOpts) {
  const pageW = doc.internal.pageSize.getWidth();

  // Top brass band
  doc.setFillColor(...ACCENT);
  doc.rect(0, 0, pageW, 4, "F");

  // Wordmark
  doc.setTextColor(...INK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(BRAND.name.toUpperCase(), 14, 18);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...MUTED);
  doc.text(BRAND.tagline, 14, 23);
  doc.text(
    `${BRAND.address}  ·  ${BRAND.phone}  ·  ${BRAND.email}  ·  ${BRAND.site}`,
    14,
    27.5,
  );

  // Document label (right rail)
  doc.setTextColor(...INK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text(docType.toUpperCase(), pageW - 14, 18, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  if (reference) {
    doc.text(`Ref  ${reference}`, pageW - 14, 23, { align: "right" });
  }
  doc.text(
    `Issued  ${issuedAt ? fmtDateTime(issuedAt) : fmtDateTime(new Date())}`,
    pageW - 14,
    27.5,
    { align: "right" },
  );

  // Hairline under masthead
  doc.setDrawColor(...HAIRLINE);
  doc.setLineWidth(0.3);
  doc.line(14, 33, pageW - 14, 33);

  doc.setTextColor(...INK);
}

function sectionLabel(doc: jsPDF, label: string, x: number, y: number) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...ACCENT);
  doc.text(label.toUpperCase(), x, y, { charSpace: 0.6 });
  doc.setTextColor(...INK);
  doc.setFont("helvetica", "normal");
}

function footer(doc: jsPDF, note?: string) {
  const pageH = doc.internal.pageSize.getHeight();
  const pageW = doc.internal.pageSize.getWidth();
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setDrawColor(...HAIRLINE);
    doc.setLineWidth(0.3);
    doc.line(14, pageH - 14, pageW - 14, pageH - 14);
    doc.setFontSize(7.5);
    doc.setTextColor(...MUTED);
    doc.text(
      note ?? `${BRAND.name} · ${BRAND.site} · ${BRAND.phone}`,
      14,
      pageH - 8,
    );
    doc.text(`Page ${i} of ${total}`, pageW - 14, pageH - 8, { align: "right" });
  }
}

function save(doc: jsPDF, filename: string, footerNote?: string) {
  footer(doc, footerNote);
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
  const pageW = doc.internal.pageSize.getWidth();
  masthead(doc, {
    docType: "Receipt",
    reference: order.reference,
    issuedAt: order.createdAt,
  });

  // Status pill
  let y = 42;
  const paid = (order.paymentStatus ?? "").toUpperCase().includes("PAID") ||
    (order.paymentStatus ?? "").toUpperCase() === "COMPLETED";
  const pillW = 36;
  doc.setFillColor(...(paid ? ([232, 244, 234] as [number, number, number]) : PAPER));
  doc.setDrawColor(...(paid ? ([90, 150, 100] as [number, number, number]) : HAIRLINE));
  doc.roundedRect(pageW - 14 - pillW, y - 5, pillW, 7, 1.5, 1.5, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...(paid ? ([40, 100, 55] as [number, number, number]) : INK));
  doc.text(
    paid ? "PAYMENT RECEIVED" : (order.paymentStatus ?? "PENDING").toUpperCase(),
    pageW - 14 - pillW / 2,
    y - 0.5,
    { align: "center" },
  );
  doc.setTextColor(...INK);
  doc.setFont("helvetica", "normal");

  // Parties
  sectionLabel(doc, "Billed to", 14, y);
  sectionLabel(doc, "Deliver to", pageW / 2, y);
  y += 5;
  doc.setFontSize(10.5);
  doc.setFont("helvetica", "bold");
  doc.text(order.customerName, 14, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.text(order.shippingAddress || "—", pageW / 2, y);
  y += 5;
  doc.text(order.customerEmail, 14, y);
  doc.text(
    [order.city, order.county, "Kenya"].filter(Boolean).join(", "),
    pageW / 2,
    y,
  );
  y += 5;
  doc.text(order.customerPhone, 14, y);

  // Items
  autoTable(doc, {
    startY: y + 8,
    head: [["#", "Item", "Qty", "Unit price", "Line total"]],
    body: order.items.map((it, i) => [
      String(i + 1).padStart(2, "0"),
      `${it.productName}${
        [it.size, it.material, it.finish].filter(Boolean).length
          ? `\n${[it.size, it.material, it.finish].filter(Boolean).join(" · ")}`
          : ""
      }${it.sku ? `\nSKU ${it.sku}` : ""}`,
      it.quantity.toLocaleString("en-KE"),
      fmt(it.unitPrice),
      fmt(it.lineTotal),
    ]) as RowInput[],
    theme: "plain",
    styles: { fontSize: 9.5, cellPadding: { top: 4, bottom: 4, left: 3, right: 3 }, textColor: INK },
    headStyles: {
      fillColor: INK,
      textColor: 255,
      fontStyle: "bold",
      fontSize: 8.5,
      cellPadding: { top: 3, bottom: 3, left: 3, right: 3 },
    },
    alternateRowStyles: { fillColor: PAPER },
    columnStyles: {
      0: { cellWidth: 10, textColor: MUTED, halign: "center" },
      2: { halign: "right", cellWidth: 18 },
      3: { halign: "right", cellWidth: 30 },
      4: { halign: "right", cellWidth: 32, fontStyle: "bold" },
    },
    margin: { left: 14, right: 14 },
  });

  // Totals
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const endY = (doc as any).lastAutoTable?.finalY ?? y + 30;
  const labelX = pageW - 72;
  const valueX = pageW - 14;
  let ty = endY + 8;
  const row = (label: string, value: string, bold = false) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(bold ? 11 : 10);
    doc.setTextColor(...(bold ? INK : MUTED));
    doc.text(label, labelX, ty);
    doc.setTextColor(...INK);
    doc.text(value, valueX, ty, { align: "right" });
    ty += bold ? 7 : 6;
  };
  row("Subtotal", fmt(order.subtotal));
  const isCourier = order.fulfillmentType === "OWN_COURIER";
  row(
    "Delivery",
    isCourier
      ? "To be confirmed"
      : order.shippingFee === 0
        ? "Free"
        : fmt(order.shippingFee),
  );
  const vat = Number(order.vatAmount ?? 0);
  if (vat > 0) row("VAT (16%)", fmt(vat));
  doc.setDrawColor(...INK);
  doc.setLineWidth(0.4);
  doc.line(labelX, ty - 2, valueX, ty - 2);
  ty += 2;
  row(`TOTAL  (${order.currency ?? "KES"})`, fmt(order.total), true);

  // Payment box
  ty += 4;
  doc.setDrawColor(...HAIRLINE);
  doc.setFillColor(...PAPER);
  doc.roundedRect(14, ty, pageW - 28, 22, 1.5, 1.5, "FD");
  sectionLabel(doc, "Payment", 18, ty + 6);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...INK);
  doc.text(`Method: ${order.paymentMethod ?? "—"}`, 18, ty + 12);
  doc.text(
    `Status: ${order.paymentStatus ?? "—"}`,
    18,
    ty + 17,
  );
  const mpesa = order.receiptNumber ?? order.paymentReference;
  if (mpesa) {
    doc.text(`M-Pesa receipt: ${mpesa}`, pageW / 2, ty + 12);
  }
  doc.text(`Order placed: ${fmtDateTime(order.createdAt)}`, pageW / 2, ty + 17);

  // Thank-you
  ty += 32;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...INK);
  doc.text("Thank you for choosing Moments Packaging.", 14, ty);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text(
    `Questions about this order? Reply to ${BRAND.email} or WhatsApp ${BRAND.phone} quoting reference ${order.reference}.`,
    14,
    ty + 5,
    { maxWidth: pageW - 28 },
  );
  doc.text(
    "This receipt is computer-generated and valid without a signature. Keep it for your records — proof of purchase is required for warranty claims, exchanges and returns within 14 days of delivery.",
    14,
    ty + 13,
    { maxWidth: pageW - 28 },
  );

  save(
    doc,
    `receipt-${order.reference}.pdf`,
    `${BRAND.name} · Receipt ${order.reference} · ${BRAND.site}`,
  );
}

// ----------------------------------------------------------------------------
// 2. Admin dispatch checklist (packer-friendly, A4, big tick boxes)
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
  const pageW = doc.internal.pageSize.getWidth();
  masthead(doc, { docType: "Dispatch checklist", reference: order.reference });

  // Recipient block
  let y = 42;
  sectionLabel(doc, "Recipient", 14, y);
  sectionLabel(doc, "Route", pageW / 2, y);
  y += 5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(order.customerName, 14, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(order.city ?? "—", pageW / 2, y);
  y += 5;
  doc.text(order.customerPhone ?? "—", 14, y);
  doc.text(
    order.trackingNumber ? `Tracking ${order.trackingNumber}` : "No tracking number",
    pageW / 2,
    y,
  );
  y += 5;
  doc.setTextColor(...MUTED);
  doc.text(order.shippingAddress ?? "—", 14, y, { maxWidth: pageW / 2 - 18 });
  doc.setTextColor(...INK);

  // Items with tick boxes
  const units = order.items.reduce((s, it) => s + Number(it.qty ?? 0), 0);
  autoTable(doc, {
    startY: y + 10,
    head: [["✓", "#", "Item", "Spec", "Qty"]],
    body: order.items.map((it, i) => [
      "",
      String(i + 1).padStart(2, "0"),
      it.name,
      [it.size, it.material].filter(Boolean).join(" · ") || "—",
      String(it.qty),
    ]) as RowInput[],
    theme: "plain",
    styles: { fontSize: 11, cellPadding: 5, valign: "middle", textColor: INK },
    headStyles: { fillColor: INK, textColor: 255, fontSize: 9 },
    alternateRowStyles: { fillColor: PAPER },
    columnStyles: {
      0: { cellWidth: 14, halign: "center" },
      1: { cellWidth: 12, textColor: MUTED },
      3: { textColor: MUTED },
      4: { halign: "right", cellWidth: 18, fontStyle: "bold" },
    },
    didDrawCell: (data) => {
      if (data.section === "body" && data.column.index === 0) {
        const size = 6;
        const x = data.cell.x + (data.cell.width - size) / 2;
        const cy = data.cell.y + (data.cell.height - size) / 2;
        doc.setDrawColor(...INK);
        doc.setLineWidth(0.5);
        doc.rect(x, cy, size, size);
      }
    },
    margin: { left: 14, right: 14 },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const endY = (doc as any).lastAutoTable?.finalY ?? y + 30;

  // Quality gate
  let qy = endY + 8;
  doc.setDrawColor(...HAIRLINE);
  doc.setFillColor(...PAPER);
  doc.roundedRect(14, qy, pageW - 28, 30, 1.5, 1.5, "FD");
  sectionLabel(doc, "Quality gate — tick before sealing", 18, qy + 6);
  const checks = [
    "Correct items, sizes and quantities",
    "Branding / artwork matches order brief",
    "Inserts, freebies, thank-you card included",
    "Outer carton clean, undamaged, taped",
    "Address label & phone visible on parcel",
    "Tracking number captured in system",
  ];
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...INK);
  checks.forEach((c, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const cx = 20 + col * ((pageW - 40) / 2);
    const cyy = qy + 12 + row * 6;
    doc.setDrawColor(...INK);
    doc.rect(cx, cyy - 3.2, 3.6, 3.6);
    doc.text(c, cx + 5.5, cyy);
  });

  // Sign-off
  let sy = qy + 38;
  sectionLabel(doc, "Sign-off", 14, sy);
  sy += 12;
  const colW = (pageW - 28 - 16) / 3;
  ["Packed by", "Checked by", "Dispatched on"].forEach((label, i) => {
    const x = 14 + i * (colW + 8);
    doc.setDrawColor(...INK);
    doc.setLineWidth(0.3);
    doc.line(x, sy, x + colW, sy);
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(label, x, sy + 4);
  });

  sy += 16;
  doc.setFontSize(8.5);
  doc.setTextColor(...MUTED);
  doc.text(
    `${order.items.length} line${order.items.length === 1 ? "" : "s"}  ·  ${units} unit${units === 1 ? "" : "s"}  ·  Keep this slip with dispatch records for 30 days.`,
    14,
    sy,
  );

  save(doc, `dispatch-${order.reference}.pdf`);
}

// ----------------------------------------------------------------------------
// 3. Admin orders report (filtered)
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

function kpiCard(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  label: string,
  value: string,
) {
  doc.setDrawColor(...HAIRLINE);
  doc.setFillColor(...PAPER);
  doc.roundedRect(x, y, w, h, 1.5, 1.5, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...ACCENT);
  doc.text(label.toUpperCase(), x + 4, y + 6, { charSpace: 0.6 });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(...INK);
  doc.text(value, x + 4, y + h - 4);
  doc.setFont("helvetica", "normal");
}

export function downloadOrdersListPdf(
  rows: OrdersListRow[],
  meta: { filterLabel?: string } = {},
) {
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "landscape" });
  const pageW = doc.internal.pageSize.getWidth();
  masthead(doc, { docType: "Orders report" });

  // Filter chip
  let y = 40;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text(`Filter: ${meta.filterLabel ?? "All statuses"}`, 14, y);

  const revenue = rows.reduce((s, o) => s + Number(o.total ?? 0), 0);
  const units = rows.reduce(
    (s, o) => s + o.items.reduce((u, it) => u + Number(it.qty ?? 0), 0),
    0,
  );
  const aov = rows.length ? revenue / rows.length : 0;
  const paid = rows.filter((o) =>
    (o.paymentStatus ?? "").toUpperCase().match(/PAID|COMPLETED/),
  ).length;

  // KPI strip
  y += 4;
  const cardW = (pageW - 28 - 18) / 4;
  kpiCard(doc, 14, y, cardW, 18, "Orders", String(rows.length));
  kpiCard(doc, 14 + (cardW + 6) * 1, y, cardW, 18, "Units", units.toLocaleString("en-KE"));
  kpiCard(doc, 14 + (cardW + 6) * 2, y, cardW, 18, "Revenue", fmt(revenue));
  kpiCard(doc, 14 + (cardW + 6) * 3, y, cardW, 18, "Avg order", fmt(aov));

  autoTable(doc, {
    startY: y + 24,
    head: [[
      "Reference",
      "Customer",
      "City",
      "Units",
      "Status",
      "Payment",
      "Total",
      "Placed",
    ]],
    body: rows.map((o) => [
      o.reference,
      o.customerName,
      o.city ?? "—",
      String(o.items.reduce((s, it) => s + Number(it.qty ?? 0), 0)),
      o.status.replace(/_/g, " "),
      o.paymentStatus,
      fmt(o.total),
      fmtDate(o.createdAt),
    ]) as RowInput[],
    theme: "plain",
    styles: { fontSize: 9, cellPadding: 3, textColor: INK },
    headStyles: { fillColor: INK, textColor: 255, fontSize: 8.5 },
    alternateRowStyles: { fillColor: PAPER },
    columnStyles: {
      3: { halign: "right" },
      6: { halign: "right", fontStyle: "bold" },
    },
    margin: { left: 14, right: 14 },
  });

  save(
    doc,
    `orders-${new Date().toISOString().slice(0, 10)}.pdf`,
    `${BRAND.name} · Orders report · ${rows.length} orders · ${fmt(revenue)} · ${paid} paid`,
  );
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
  const pageW = doc.internal.pageSize.getWidth();
  masthead(doc, { docType: "Customer statement" });

  // Identity
  let y = 42;
  sectionLabel(doc, "Account", 14, y);
  y += 5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...INK);
  doc.text(customer.name, 14, y);
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...MUTED);
  doc.text(
    [customer.email, customer.phone, customer.city].filter(Boolean).join("  ·  "),
    14,
    y,
  );

  // Period
  const first = customer.firstOrderAt
    ? fmtDate(customer.firstOrderAt)
    : orders.length
      ? fmtDate(orders[orders.length - 1].createdAt)
      : "—";
  const last = customer.lastOrderAt
    ? fmtDate(customer.lastOrderAt)
    : orders.length
      ? fmtDate(orders[0].createdAt)
      : "—";
  doc.setFontSize(9);
  doc.text(`Statement period: ${first} → ${last}`, pageW - 14, y, { align: "right" });

  // KPI cards
  y += 8;
  const cardW = (pageW - 28 - 12) / 3;
  kpiCard(doc, 14, y, cardW, 22, "Lifetime value", fmt(customer.lifetimeValue ?? 0));
  kpiCard(doc, 14 + cardW + 6, y, cardW, 22, "Orders", String(customer.ordersCount ?? orders.length));
  kpiCard(doc, 14 + (cardW + 6) * 2, y, cardW, 22, "Average order", fmt(customer.averageOrderValue ?? 0));

  // Orders
  autoTable(doc, {
    startY: y + 30,
    head: [["#", "Reference", "Placed", "Units", "Status", "Payment", "Total"]],
    body: orders.map((o, i) => [
      String(i + 1).padStart(2, "0"),
      o.reference,
      fmtDate(o.createdAt),
      String(o.items.reduce((s, it) => s + Number(it.qty ?? 0), 0)),
      o.status.replace(/_/g, " "),
      o.paymentStatus,
      fmt(o.total),
    ]) as RowInput[],
    theme: "plain",
    styles: { fontSize: 9.5, cellPadding: 3.5, textColor: INK },
    headStyles: { fillColor: INK, textColor: 255, fontSize: 8.5 },
    alternateRowStyles: { fillColor: PAPER },
    columnStyles: {
      0: { cellWidth: 10, textColor: MUTED, halign: "center" },
      3: { halign: "right" },
      6: { halign: "right", fontStyle: "bold" },
    },
    margin: { left: 14, right: 14 },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const endY = (doc as any).lastAutoTable?.finalY ?? y + 60;
  const total = orders.reduce((s, o) => s + Number(o.total ?? 0), 0);
  let ty = endY + 8;
  doc.setDrawColor(...INK);
  doc.setLineWidth(0.4);
  doc.line(pageW - 86, ty - 2, pageW - 14, ty - 2);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Statement total", pageW - 86, ty + 4);
  doc.text(fmt(total), pageW - 14, ty + 4, { align: "right" });

  // Footnote
  ty += 14;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...MUTED);
  doc.text(
    `Statement generated on ${fmtDateTime(new Date())}. Figures include VAT where applicable. For queries, email ${BRAND.email} quoting this account name.`,
    14,
    ty,
    { maxWidth: pageW - 28 },
  );

  save(
    doc,
    `statement-${customer.name.replace(/\s+/g, "-").toLowerCase()}.pdf`,
    `${BRAND.name} · Statement for ${customer.name} · ${BRAND.site}`,
  );
}
