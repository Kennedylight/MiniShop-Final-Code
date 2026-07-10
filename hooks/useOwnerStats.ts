// hooks/useOwnerStats.ts
import { useEffect, useMemo, useState } from "react";
import { subscribeOwnerOrders } from "@/services/orderService";
import { listOwnerProducts } from "@/services/productService";
import { Order, OrderStatus } from "@/types/Order";

export type TimelineBucket = { date: string; count: number; revenue: number };

export type OwnerStats = {
  totalOrders: number;
  activeOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  revenue: number;
  averageOrder: number;
  productsCount: number;
  byStatus: Record<OrderStatus, number>;
  timeline: TimelineBucket[];
  recent: Order[];
};

const STATUSES: OrderStatus[] = [
  "new",
  "confirmed",
  "in_process",
  "ready",
  "out_for_delivery",
  "completed",
  "cancelled",
];

// Même format de clé que fmtDate côté web : YYYY-MM-DD
function fmtDate(ts: number): string {
  return new Date(ts).toISOString().slice(0, 10);
}

export function useOwnerStats(uid?: string | null) {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [productsCount, setProductsCount] = useState(0);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    if (!uid) {
      setOrders([]);
      return;
    }
    return subscribeOwnerOrders(uid, setOrders);
  }, [uid]);

  useEffect(() => {
    if (!uid) {
      setLoadingProducts(false);
      return;
    }
    listOwnerProducts(uid)
      .then((p) => setProductsCount(p.length))
      .finally(() => setLoadingProducts(false));
  }, [uid]);

  const isLoading = orders === null || loadingProducts;

  const data = useMemo<OwnerStats | undefined>(() => {
    if (!orders) return undefined;

    const byStatus = STATUSES.reduce((acc, s) => {
      acc[s] = 0;
      return acc;
    }, {} as Record<OrderStatus, number>);

    let completed = 0;
    let cancelled = 0;
    let active = 0;
    let revenue = 0;
    const buckets = new Map<string, { count: number; revenue: number }>();

    for (const o of orders) {
      byStatus[o.status] += 1;

      if (o.status === "completed") {
        completed += 1;
        revenue += o.estimatedTotal || 0;
      } else if (o.status === "cancelled") {
        cancelled += 1;
      } else {
        active += 1;
      }

      const key = fmtDate((o as any).createdAt);
      const cur = buckets.get(key) ?? { count: 0, revenue: 0 };
      cur.count += 1;
      if (o.status === "completed") cur.revenue += o.estimatedTotal || 0;
      buckets.set(key, cur);
    }

    const timeline = [...buckets.entries()]
      .sort((a, b) => (a[0] < b[0] ? -1 : 1))
      .slice(-14)
      .map(([date, v]) => ({ date, count: v.count, revenue: v.revenue }));

    // Tri explicite décroissant, car subscribeOwnerOrders (temps réel) ne garantit
    // pas le même ordre que listOwnerOrders côté web
    const sorted = [...orders].sort(
      (a, b) => ((b as any).createdAt || 0) - ((a as any).createdAt || 0)
    );

    return {
      totalOrders: orders.length,
      activeOrders: active,
      completedOrders: completed,
      cancelledOrders: cancelled,
      revenue,
      averageOrder: completed > 0 ? revenue / completed : 0,
      productsCount,
      byStatus,
      timeline,
      recent: sorted.slice(0, 5),
    };
  }, [orders, productsCount]);

  return { data, isLoading };
}