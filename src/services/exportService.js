import ExcelJS from "exceljs";
import { reportRepository } from "../repositories/reportRepository.js";

const SHEET_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

// makes the first row bold with a colored background
const styleHeader = (sheet) => {
  const header = sheet.getRow(1);
  header.font = { bold: true, color: { argb: "FFFFFFFF" } };
  header.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF4F46E5" },
  };
  sheet.views = [{ state: "frozen", ySplit: 1 }];
};

const send = async (workbook, res, filename) => {
  res.setHeader("Content-Type", SHEET_TYPE);
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  await workbook.xlsx.write(res);
  res.end();
};

export const exportService = {
  async products(res) {
    const products = await reportRepository.productsForExport();

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Products");
    sheet.columns = [
      { header: "SKU", key: "sku", width: 22 },
      { header: "Name", key: "name", width: 36 },
      { header: "Category", key: "category", width: 20 },
      { header: "Supplier", key: "supplier", width: 26 },
      { header: "Brand", key: "brand", width: 18 },
      { header: "Price ($)", key: "price", width: 12 },
      { header: "Cost price ($)", key: "costPrice", width: 15 },
      { header: "Stock", key: "stock", width: 10 },
      { header: "Low stock limit", key: "lowStockLimit", width: 16 },
      { header: "Stock value ($)", key: "stockValue", width: 16 },
    ];

    products.forEach((product) => {
      sheet.addRow({
        sku: product.sku,
        name: product.name,
        category: product.category?.name || "",
        supplier: product.supplier?.name || "",
        brand: product.brand || "",
        price: product.price,
        costPrice: product.costPrice,
        stock: product.stock,
        lowStockLimit: product.lowStockLimit,
        stockValue: Math.round(product.stock * product.costPrice * 100) / 100,
      });
    });

    styleHeader(sheet);
    await send(workbook, res, "stocknest-products.xlsx");
  },

  async sales(res) {
    const sales = await reportRepository.salesForExport();

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Sales");
    sheet.columns = [
      { header: "Invoice", key: "invoice", width: 22 },
      { header: "Date", key: "date", width: 20 },
      { header: "Customer", key: "customer", width: 24 },
      { header: "Payment", key: "payment", width: 12 },
      { header: "Items", key: "items", width: 8 },
      { header: "Subtotal ($)", key: "subtotal", width: 14 },
      { header: "Discount ($)", key: "discount", width: 14 },
      { header: "Total ($)", key: "total", width: 14 },
      { header: "Status", key: "status", width: 12 },
      { header: "Cashier", key: "cashier", width: 20 },
    ];

    sales.forEach((sale) => {
      sheet.addRow({
        invoice: sale.invoiceNumber,
        date: new Date(sale.createdAt).toLocaleString("en-GB", {
          timeZone: "Asia/Dhaka",
        }),
        customer: sale.customerName,
        payment: sale.paymentMethod,
        items: sale.items.length,
        subtotal: sale.subtotal,
        discount: sale.discount,
        total: sale.totalAmount,
        status: sale.status,
        cashier: sale.createdBy?.name || "",
      });
    });

    styleHeader(sheet);
    await send(workbook, res, "stocknest-sales.xlsx");
  },
};
