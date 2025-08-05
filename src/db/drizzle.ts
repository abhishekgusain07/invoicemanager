import { config } from "dotenv";
import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";

config({ path: ".env" });

// Create connection pool for better performance
const pool = new Pool({ connectionString: process.env.DATABASE_URL! });

export const db = drizzle(pool);
