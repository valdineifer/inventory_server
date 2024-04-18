import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

export default async function initDatabase(databaseName?: string) {
  if (!process.env.DB_URL) throw new Error('DB_URL env var not set');

  const pgConnection = postgres(process.env.DB_URL, {
    max: 1,
    onnotice: () => {},
    db: databaseName || process.env.DB_URL.split('/').pop(),
  });

  await migrate(
    drizzle(pgConnection, { logger: false }),
    { migrationsFolder: 'src/database/drizzle' },
  );
  await pgConnection.end();
}
