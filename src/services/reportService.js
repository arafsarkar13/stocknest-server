import { reportRepository } from "../repositories/reportRepository.js";

const DAYS = 14;
const DAY_MS = 24 * 60 * 60 * 1000;
const BD_OFFSET = 6 * 60 * 60 * 1000; // Bangladesh is UTC+6
const round2 = (number) => Math.round((number || 0) * 100) / 100;

// "2026-11-13" for the Bangladesh calendar day of a timestamp
const dayKey = (time) => new Date(time + BD_OFFSET).toISOString().slice(0, 10);

export const reportService = {
  async dashboard() {
    const since = new Date(Date.now() - DAYS * DAY_MS);

    const [
      totals,
      profitRow,
      byDay,
      topProducts,
      byCategory,
      inventory,
      lowStock,
    ] = await Promise.all([
      reportRepository.salesTotals(),
      reportRepository.itemProfit(),
      reportRepository.salesByDay(since),
      reportRepository.topProducts(5),
      reportRepository.salesByCategory(6),
      reportRepository.inventorySummary(),
      reportRepository.lowStockProducts(6),
    ]);

    // fill days without sales with 0, so the chart has no gaps
    const dayMap = new Map(byDay.map((day) => [day._id, day]));
    const daily = [];
    for (let i = DAYS - 1; i >= 0; i--) {
      const key = dayKey(Date.now() - i * DAY_MS);
      const found = dayMap.get(key);
      daily.push({
        date: key,
        revenue: round2(found?.revenue),
        orders: found?.orders || 0,
      });
    }

    return {
      sales: {
        revenue: round2(totals.revenue),
        orders: totals.orders,
        averageOrder: totals.orders
          ? round2(totals.revenue / totals.orders)
          : 0,
        profit: round2(profitRow.profit - totals.discount),
        unitsSold: profitRow.unitsSold,
      },
      inventory: {
        products: inventory.products,
        units: inventory.units,
        stockValue: round2(inventory.stockValue),
        lowStock: inventory.lowStock,
        outOfStock: inventory.outOfStock,
      },
      daily,
      topProducts: topProducts.map((item) => ({
        name: item.name,
        units: item.units,
        revenue: round2(item.revenue),
      })),
      byCategory: byCategory.map((item) => ({
        name: item._id,
        revenue: round2(item.revenue),
        units: item.units,
      })),
      lowStock,
    };
  },
};
