import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

if (!process.env.DB_URL) throw new Error('DB_URL env var not set');

// for query purposes
export const pgClient = postgres(process.env.DB_URL, { onnotice: () => {} });

export const db = drizzle(pgClient, { schema, logger: false });
