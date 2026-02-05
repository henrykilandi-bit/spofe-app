import { Pool } from 'pg';

/**
 * Vérifie qu'aucune écriture n'a eu lieu
 */
export async function expectNoRows(
  pool: Pool,
  table: string
): Promise<void> {
  const res = await pool.query(`SELECT COUNT(*) FROM ${table}`);
  expect(Number(res.rows[0].count)).toBe(0);
}

/**
 * Vérifie qu'une ligne existe
 */
export async function expectOneRow(
  pool: Pool,
  table: string
): Promise<void> {
  const res = await pool.query(`SELECT COUNT(*) FROM ${table}`);
  expect(Number(res.rows[0].count)).toBe(1);
}