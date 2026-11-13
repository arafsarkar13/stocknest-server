import PDFDocument from "pdfkit";

const money = (amount) => `$${Number(amount || 0).toFixed(2)}`;

export function buildInvoicePdf(sale, res) {
  const doc = new PDFDocument({ margin: 50, size: "A4" });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${sale.invoiceNumber}.pdf"`,
  );
  doc.pipe(res);

  // header
  doc
    .font("Helvetica-Bold")
    .fontSize(22)
    .fillColor("#000")
    .text("StockNest", 50, 50);
  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor("#555")
    .text("NestMart Retail Stores", 50, 76);
  doc
    .font("Helvetica-Bold")
    .fontSize(20)
    .fillColor("#000")
    .text("INVOICE", 50, 50, { width: 495, align: "right" });
  if (sale.status === "cancelled") {
    doc
      .fontSize(12)
      .fillColor("#cc0000")
      .text("CANCELLED", 50, 76, { width: 495, align: "right" });
  }

  // sale details
  doc.font("Helvetica").fontSize(10).fillColor("#000");
  const details = [
    ["Invoice no", sale.invoiceNumber],
    ["Date", new Date(sale.createdAt).toLocaleString("en-GB")],
    ["Customer", sale.customerName],
    ["Phone", sale.customerPhone || "-"],
    ["Payment", sale.paymentMethod],
    ["Cashier", sale.createdBy?.name || "-"],
  ];
  let y = 115;
  details.forEach(([label, value]) => {
    doc.fillColor("#777").text(`${label}:`, 50, y, { width: 90 });
    doc.fillColor("#000").text(String(value), 140, y, { width: 300 });
    y += 16;
  });

  // table header
  y += 14;
  doc.font("Helvetica-Bold").fontSize(10).fillColor("#000");
  doc.text("Product", 50, y, { width: 240 });
  doc.text("Qty", 300, y, { width: 50, align: "right" });
  doc.text("Price", 360, y, { width: 80, align: "right" });
  doc.text("Total", 450, y, { width: 95, align: "right" });
  y += 16;
  doc.moveTo(50, y).lineTo(545, y).strokeColor("#999").stroke();
  y += 8;

  // table rows
  doc.font("Helvetica").fontSize(10);
  sale.items.forEach((item) => {
    if (y > 700) {
      doc.addPage();
      y = 50;
    }
    const height = doc.heightOfString(item.name, { width: 240 });
    doc.text(item.name, 50, y, { width: 240 });
    doc.text(String(item.quantity), 300, y, { width: 50, align: "right" });
    doc.text(money(item.unitPrice), 360, y, { width: 80, align: "right" });
    doc.text(money(item.lineTotal), 450, y, { width: 95, align: "right" });
    y += Math.max(height, 14) + 8;
  });

  // totals
  y += 6;
  doc.moveTo(300, y).lineTo(545, y).strokeColor("#999").stroke();
  y += 10;
  doc.text("Subtotal", 300, y, { width: 140 });
  doc.text(money(sale.subtotal), 450, y, { width: 95, align: "right" });
  y += 18;
  doc.text("Discount", 300, y, { width: 140 });
  doc.text(`-${money(sale.discount)}`, 450, y, { width: 95, align: "right" });
  y += 20;
  doc.font("Helvetica-Bold").fontSize(13);
  doc.text("Total", 300, y, { width: 140 });
  doc.text(money(sale.totalAmount), 450, y, { width: 95, align: "right" });

  // footer
  doc.font("Helvetica").fontSize(10).fillColor("#777");
  doc.text("Thank you for shopping at NestMart!", 50, 770, {
    width: 495,
    align: "center",
  });

  doc.end();
}
