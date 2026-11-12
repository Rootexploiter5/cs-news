import { Pool, QueryResult, QueryResultRow } from "pg";

const connectionString =
  process.env.DATABASE_URL ||
  process.env.HOST_DATABASE_URL ||
  "postgresql://sentinel:sentinel_secure_pass_2026@localhost:5432/sentinel_db";

const pool = new Pool({
  connectionString,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle PostgreSQL client", err);
});

export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const start = Date.now();
  try {
    const res = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === "development") {
      console.log("Executed query", { text: text.substring(0, 60), duration, rows: res.rowCount });
    }
    return res;
  } catch (error) {
    console.error("Database query execution error:", { text, error });
    throw error;
  }
}

export default pool;
