import 'dotenv/config';
import type { Config } from 'drizzle-kit';

export default {
  schema: './app/.server/database/schema.ts',
  out: './app/.server/database/drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DB_URL!,
  }
} satisfies Config;
