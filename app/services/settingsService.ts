import { db } from '~/database/db';

export async function getSettings() {
  const settings = await db.query.settings.findFirst();

  return settings?.value || {};
}