import { drizzle } from 'drizzle-orm/mysql2';
import { createPool, type Pool } from 'mysql2/promise';
import * as schema from './schema';

declare global {
  var _mysqlPool: Pool | undefined;
}

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL must be set to connect to MySQL.');
}

export const getPool = (): Pool => {
  if (!global._mysqlPool) {
    global._mysqlPool = createPool(databaseUrl);
  }
  return global._mysqlPool;
};

const pool = getPool();

export const db = drizzle(pool, { schema, mode: 'default' });
export { schema };
