import { Pool } from "pg";

// Parse the connection string from environment variable
const connectionString = process.env.DATABASE_URL;

// Create a new pool instance
const pool = new Pool({
  connectionString,
  ssl: false, // Disable SSL since we're connecting locally
});

// Test the connection
pool.on("connect", () => {
  console.log("Successfully connected to PostgreSQL");
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

// Export the pool instance
export const db = pool;

// Helper function to execute queries
export async function executeQuery<T>(
  query: string,
  params?: any[]
): Promise<T[]> {
  const client = await pool.connect();
  try {
    const result = await client.query(query, params);
    return result.rows;
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  } finally {
    client.release();
  }
}
