import express from "express";
import pkg from "pg";
const { Pool } = pkg;

const app = express();
const PORT = process.env.PORT || 3000;

const pool = new Pool({
  host: process.env.PGHOST || "db",
  port: Number(process.env.PGPORT || 5432),
  user: process.env.PGUSER || "appuser",
  password: process.env.PGPASSWORD || "apppass",
  database: process.env.PGDATABASE || "appdb",
  max: 10,
  idleTimeoutMillis: 30000
});

async function ensureSchema() {
  await pool.query(`CREATE TABLE IF NOT EXISTS hits (
    id SERIAL PRIMARY KEY,
    ts TIMESTAMPTZ NOT NULL DEFAULT now()
  )`);
}

app.get("/health", (_req, res) => res.status(200).send("ok"));

app.get("/", async (_req, res) => {
  try {
    await ensureSchema();
    await pool.query("INSERT INTO hits DEFAULT VALUES");
    const { rows } = await pool.query("SELECT COUNT(*)::int AS count FROM hits");
    res.json({
      message: "Hello from Node behind Nginx with Postgres 📦",
      total_hits: rows[0].count
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "DB error", details: String(e) });
  }
});

app.listen(PORT, () => console.log(`App listening on :${PORT}`));
