import { count, eq } from 'drizzle-orm';
import { db } from '~/database/db';
import { settings } from '~/database/schema';
import { Settings } from '~/types/models';

export async function getSettings(): Promise<Settings> {
  const settings = await db.query.settings.findFirst();

  return settings?.value || {};
}

export async function saveSettings(data: Settings) {
  const [{ count: counter }] = await db.select({ count: count() }).from(settings);

  if (!counter) {
    await db.insert(settings).values({
      key: 'settings',
      value: data,
    });

    return true;
  }

  await db.update(settings)
    .set({
      value: data,
    })
    .where(eq(settings.key, 'settings'))
    .returning({ id: settings.id });

  return true;
}
