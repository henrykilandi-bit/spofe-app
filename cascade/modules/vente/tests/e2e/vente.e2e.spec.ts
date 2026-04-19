import { describe, test, expect, beforeEach } from '@jest/globals';
import request from "supertest";
import { setupTestApp } from "./setupTestApp";

describe("E2E — Module Vente v1.0.0", () => {
  const tenantId = "tenant-1";
  let db: any;
  let app: any;

  beforeEach(() => {
    // DB in-memory ultra simple
    db = {
      tables: {
        sales_quotes: [],
        sales_orders: [],
        delivery_notes: [],
        sales_invoices: [],
      },
      insert(table: string, row: any) {
        this.tables[table].push(row);
      },
      select(table: string, query: any) {
        return this.tables[table].filter(
          (r: any) => r.tenant_id === query.where.tenant_id
        );
      },
      selectOne(table: string, where: any) {
        return this.tables[table].find(
          (r: any) =>
            r.tenant_id === where.tenant_id &&
            Object.values(where).every((v) =>
              Object.values(r).includes(v)
            )
        );
      },
    };

    app = setupTestApp(db);
  });

  test("full sales lifecycle is readable via API", async () => {
    // simulate projections (as if events were handled)
    db.insert("sales_quotes", {
      tenant_id: tenantId,
      quote_id: "Q1",
      status: "VALIDATED",
      created_at: new Date().toISOString(),
    });

    db.insert("sales_orders", {
      tenant_id: tenantId,
      order_id: "O1",
      quote_id: "Q1",
      status: "VALIDATED",
      created_at: new Date().toISOString(),
    });

    db.insert("delivery_notes", {
      tenant_id: tenantId,
      delivery_note_id: "D1",
      order_id: "O1",
      status: "VALIDATED",
    });

    db.insert("sales_invoices", {
      tenant_id: tenantId,
      invoice_id: "I1",
      order_id: "O1",
      delivery_note_id: "D1",
      status: "VALIDATED",
    });

    const quotes = await request(app)
      .get("/vente/devis")
      .set("X-Tenant-Id", tenantId);

    const orders = await request(app)
      .get("/vente/commandes")
      .set("X-Tenant-Id", tenantId);

    const deliveries = await request(app)
      .get("/vente/livraisons")
      .set("X-Tenant-Id", tenantId);

    const invoices = await request(app)
      .get("/vente/factures")
      .set("X-Tenant-Id", tenantId);

    expect(quotes.body.length).toBe(1);
    expect(orders.body.length).toBe(1);
    expect(deliveries.body.length).toBe(1);
    expect(invoices.body.length).toBe(1);
  });

  test("tenant isolation is enforced", async () => {
    db.insert("sales_quotes", {
      tenant_id: "other-tenant",
      quote_id: "QX",
      status: "VALIDATED",
      created_at: new Date().toISOString(),
    });

    const res = await request(app)
      .get("/vente/devis")
      .set("X-Tenant-Id", tenantId);

    expect(res.body.length).toBe(0);
  });

  test("API requires tenant header", async () => {
    const res = await request(app)
      .get("/vente/devis");

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('X-Tenant-Id header required');
  });
});
