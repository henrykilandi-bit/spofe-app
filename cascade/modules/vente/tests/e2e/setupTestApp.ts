import express from "express";
import { venteApi } from "../../src/api";

export function setupTestApp(db: any) {
  const app = express();
  app.use(express.json());

  // API Vente avec DB de test
  app.use("/vente", venteApi(db));

  return app;
}
