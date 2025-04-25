import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { envs } from '../config/envs';

const pool = new Pool({
  connectionString: envs.databaseUrl,
});

export const db = drizzle({ client: pool });
