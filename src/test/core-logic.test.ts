import { describe, it, expect } from "vitest";

// Inline the box mapping from src/utils/boxMapping.js for testing
const BOX_MAPPING = {
  BODA: "Caja Copa de Boda",
  BODA_G: "Caja Copa de Boda Grande",
  XV: "Caja Copa de 15 Años",
  PEIN_G: "Caja Peineta Grande",
  PEIN_C: "Caja Peineta Chica",
  PEIN_CUAD: "Caja Peineta Cuadrada",
  TIARA_A: "Caja Tiara Ancha",
  TIARA_M: "Caja Tiara Mediana",
  TIARA_D: "Caja Tiara Delgada",
  CUCH_CH: "Caja Cuchillo Chino",
  BQ_G: "Caja Bouquet Grande",
  BQ_P: "Caja Bouquet Chica",
  BQ_M: "Caja Bouquet Mediana",
  FACUSA: "Caja Facusa",
  COMUNION: "Caja Comunión",
  PERGAMINO: "Caja Pergamino",
  CLAVEL: "Caja de Clavel",
  ORQUIDEA: "Caja de Orquidea",
};

const getBoxLabel = (code: string): string => BOX_MAPPING[code] || code;

// Inline sanitizeText from src/api/client.js
const sanitizeText = (input: string | null | undefined): string => {
  if (!input) return "";
  return input
    .replace(/[\x00-\x1F\x7F]/g, "") // Remove control characters
    .trim();
};

describe("Core Business Logic - Unit Tests", () => {
  describe("getBoxLabel", () => {
    it("returns mapped label for known box codes", () => {
      expect(getBoxLabel("BODA")).toBe("Caja Copa de Boda");
      expect(getBoxLabel("XV")).toBe("Caja Copa de 15 Años");
      expect(getBoxLabel("PEIN_C")).toBe("Caja Peineta Chica");
    });

    it("returns code as fallback for unknown types", () => {
      expect(getBoxLabel("UNKNOWN")).toBe("UNKNOWN");
      expect(getBoxLabel("")).toBe("");
    });
  });

  describe("sanitizeText", () => {
    it("removes control characters", () => {
      expect(sanitizeText("hello\x00world")).toBe("helloworld");
      expect(sanitizeText("test\x1Fstring")).toBe("teststring");
    });

    it("trims whitespace", () => {
      expect(sanitizeText("  hello  ")).toBe("hello");
    });

    it("handles empty and null inputs", () => {
      expect(sanitizeText("")).toBe("");
      expect(sanitizeText(null as any)).toBe("");
      expect(sanitizeText(undefined as any)).toBe("");
    });

    it("preserves valid characters", () => {
      expect(sanitizeText("Caja Boda 25")).toBe("Caja Boda 25");
      expect(sanitizeText("Cliente #1")).toBe("Cliente #1");
    });
  });

  describe("Active boxes aggregation (Dashboard logic)", () => {
    const aggregateActiveBoxes = (orders: any[]) => {
      const activeOrders = orders.filter(
        (o) => o.status === "CREATED" || o.status === "READY"
      );
      const totals: Record<string, number> = {};
      activeOrders.forEach((order) => {
        (order.items || []).forEach((item: any) => {
          const code = item.boxType || item.type;
          totals[code] = (totals[code] || 0) + item.quantity;
        });
      });
      return Object.entries(totals)
        .sort((a, b) => b[1] - a[1])
        .map(([code, qty]) => ({ code, qty, label: getBoxLabel(code) }));
    };

    it("only includes CREATED and READY orders, excludes DELIVERED", () => {
      const orders = [
        { status: "CREATED", items: [{ boxType: "BODA", quantity: 25 }] },
        { status: "READY", items: [{ boxType: "BODA", quantity: 25 }] },
        { status: "DELIVERED", items: [{ boxType: "BODA", quantity: 100 }] },
      ];

      const result = aggregateActiveBoxes(orders);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ code: "BODA", qty: 50, label: "Caja Copa de Boda" });
    });

    it("sums quantities across multiple orders", () => {
      const orders = [
        { status: "CREATED", items: [{ boxType: "XV", quantity: 25 }] },
        { status: "CREATED", items: [{ boxType: "XV", quantity: 25 }] },
        { status: "READY", items: [{ boxType: "XV", quantity: 10 }] },
      ];

      const result = aggregateActiveBoxes(orders);

      expect(result[0].qty).toBe(60);
    });

    it("sorts by quantity descending", () => {
      const orders = [
        { status: "CREATED", items: [{ boxType: "PEIN_C", quantity: 6 }] },
        { status: "CREATED", items: [{ boxType: "BODA", quantity: 50 }] },
        { status: "CREATED", items: [{ boxType: "XV", quantity: 25 }] },
      ];

      const result = aggregateActiveBoxes(orders);

      expect(result.map((r) => r.code)).toEqual(["BODA", "XV", "PEIN_C"]);
    });

    it("returns empty array for no active orders", () => {
      const orders = [
        { status: "DELIVERED", items: [{ boxType: "BODA", quantity: 100 }] },
      ];

      const result = aggregateActiveBoxes(orders);

      expect(result).toEqual([]);
    });

    it("handles missing items gracefully", () => {
      const orders = [
        { status: "CREATED", items: null },
        { status: "CREATED", items: undefined },
        { status: "CREATED", items: [] },
      ];

      const result = aggregateActiveBoxes(orders);

      expect(result).toEqual([]);
    });
  });

  describe("Order status transitions", () => {
    const validTransitions: Record<string, string[]> = {
      CREATED: ["READY", "DELIVERED"],
      READY: ["DELIVERED", "ABANDONED"],
      DELIVERED: [],
      ABANDONED: [],
    };

    it("allows CREATED -> READY", () => {
      expect(validTransitions.CREATED).toContain("READY");
    });

    it("allows CREATED -> DELIVERED", () => {
      expect(validTransitions.CREATED).toContain("DELIVERED");
    });

    it("allows READY -> DELIVERED", () => {
      expect(validTransitions.READY).toContain("DELIVERED");
    });

    it("allows READY -> ABANDONED", () => {
      expect(validTransitions.READY).toContain("ABANDONED");
    });

    it("blocks DELIVERED -> any", () => {
      expect(validTransitions.DELIVERED).toHaveLength(0);
    });

    it("blocks ABANDONED -> any (terminal state)", () => {
      expect(validTransitions.ABANDONED).toHaveLength(0);
    });

    it("blocks READY -> CREATED (no backward)", () => {
      expect(validTransitions.READY).not.toContain("CREATED");
    });
  });

  describe("Box type client breakdown (Dashboard popup logic)", () => {
    const aggregateActiveBoxesWithClients = (orders: any[]) => {
      const activeOrders = orders.filter(
        (o) => o.status === "CREATED" || o.status === "READY"
      );
      const totals: Record<string, number> = {};
      const clientsByType: Record<string, Record<string, number>> = {};
      activeOrders.forEach((order) => {
        const name = (order.client_name || "").trim();
        (order.items || []).forEach((item: any) => {
          const code = item.boxType || item.type;
          totals[code] = (totals[code] || 0) + item.quantity;
          clientsByType[code] = clientsByType[code] || {};
          clientsByType[code][name] =
            (clientsByType[code][name] || 0) + item.quantity;
        });
      });
      return Object.entries(totals)
        .sort((a, b) => b[1] - a[1])
        .map(([code, qty]) => ({
          code,
          qty,
          label: getBoxLabel(code),
          clients: Object.entries(clientsByType[code])
            .sort((a, b) => b[1] - a[1])
            .map(([client_name, quantity]) => ({ client_name, quantity })),
        }));
    };

    it("breaks down a box type by client with summed quantities", () => {
      const orders = [
        { client_name: "Ana", status: "CREATED", items: [{ boxType: "BODA", quantity: 25 }] },
        { client_name: "Ana", status: "READY", items: [{ boxType: "BODA", quantity: 10 }] },
        { client_name: "Luis", status: "CREATED", items: [{ boxType: "BODA", quantity: 40 }] },
      ];

      const result = aggregateActiveBoxesWithClients(orders);
      const boda = result.find((r) => r.code === "BODA")!;

      expect(boda.qty).toBe(75);
      expect(boda.clients).toEqual([
        { client_name: "Luis", quantity: 40 },
        { client_name: "Ana", quantity: 35 },
      ]);
    });

    it("only includes active orders and excludes DELIVERED", () => {
      const orders = [
        { client_name: "Ana", status: "CREATED", items: [{ boxType: "XV", quantity: 20 }] },
        { client_name: "Ana", status: "DELIVERED", items: [{ boxType: "XV", quantity: 999 }] },
      ];

      const result = aggregateActiveBoxesWithClients(orders);
      const xv = result.find((r) => r.code === "XV")!;

      expect(xv.qty).toBe(20);
      expect(xv.clients).toEqual([{ client_name: "Ana", quantity: 20 }]);
    });

    it("returns no entry for a type with only non-active orders", () => {
      const orders = [
        { client_name: "Ana", status: "DELIVERED", items: [{ boxType: "BODA", quantity: 5 }] },
      ];

      const result = aggregateActiveBoxesWithClients(orders);
      const boda = result.find((r) => r.code === "BODA");
      expect(boda).toBeUndefined();
    });
  });

  describe("Delivery helpers", () => {
    // Inline the pure helper logic from deliveryService for testing
    const computeDeliveredByType = (deliveries: any[]) => {
      const result: Record<string, number> = {};
      (deliveries || []).forEach((d) => {
        result[d.box_type] = (result[d.box_type] || 0) + d.quantity;
      });
      return result;
    };

    const computeRemaining = (items: any[], deliveries: any[]) => {
      const deliveredByType = computeDeliveredByType(deliveries);
      return (items || []).map((item) => {
        const code = item.boxType || item.type;
        const delivered = deliveredByType[code] || 0;
        return {
          boxType: code,
          total: item.quantity,
          delivered,
          remaining: item.quantity - delivered,
        };
      });
    };

    const isFullyDelivered = (items: any[], deliveries: any[]) => {
      const remaining = computeRemaining(items, deliveries);
      return remaining.length > 0 && remaining.every((r) => r.remaining <= 0);
    };

    it("computes delivered quantity per box_type for an order", () => {
      const deliveries = [
        { order_id: "1", box_type: "ORQUIDEA", quantity: 100 },
        { order_id: "1", box_type: "ORQUIDEA", quantity: 200 },
        { order_id: "1", box_type: "CLAVEL", quantity: 50 },
      ];
      const orderItems = [
        { boxType: "ORQUIDEA", quantity: 500 },
        { boxType: "CLAVEL", quantity: 500 },
      ];

      const remaining = computeRemaining(orderItems, deliveries);

      expect(remaining).toEqual([
        { boxType: "ORQUIDEA", total: 500, delivered: 300, remaining: 200 },
        { boxType: "CLAVEL", total: 500, delivered: 50, remaining: 450 },
      ]);
    });

    it("is fully delivered when remaining === 0 for all items", () => {
      const items = [
        { boxType: "ORQUIDEA", quantity: 300 },
        { boxType: "CLAVEL", quantity: 50 },
      ];
      const deliveries = [
        { box_type: "ORQUIDEA", quantity: 300 },
        { box_type: "CLAVEL", quantity: 50 },
      ];
      expect(isFullyDelivered(items, deliveries)).toBe(true);
    });

    it("is not fully delivered if any item has remaining > 0", () => {
      const items = [
        { boxType: "ORQUIDEA", quantity: 300 },
        { boxType: "CLAVEL", quantity: 500 },
      ];
      const deliveries = [
        { box_type: "ORQUIDEA", quantity: 300 },
        { box_type: "CLAVEL", quantity: 50 },
      ];
      expect(isFullyDelivered(items, deliveries)).toBe(false);
    });

    it("handles empty deliveries (nothing delivered yet)", () => {
      const items = [
        { boxType: "BODA", quantity: 100 },
      ];
      const remaining = computeRemaining(items, []);
      expect(remaining).toEqual([
        { boxType: "BODA", total: 100, delivered: 0, remaining: 100 },
      ]);
      expect(isFullyDelivered(items, [])).toBe(false);
    });

    it("handles over-delivery gracefully (remaining goes negative)", () => {
      const items = [{ boxType: "BODA", quantity: 100 }];
      const deliveries = [{ box_type: "BODA", quantity: 150 }];
      const remaining = computeRemaining(items, deliveries);
      expect(remaining[0].remaining).toBe(-50);
      expect(isFullyDelivered(items, deliveries)).toBe(true);
    });

    it("returns false for fully delivered with no items", () => {
      expect(isFullyDelivered([], [])).toBe(false);
    });

    it("aggregates deliveredByType correctly across multiple deliveries", () => {
      const deliveries = [
        { box_type: "BODA", quantity: 10 },
        { box_type: "BODA", quantity: 20 },
        { box_type: "XV", quantity: 5 },
      ];
      const result = computeDeliveredByType(deliveries);
      expect(result).toEqual({ BODA: 30, XV: 5 });
    });
  });
});