import { sql } from 'drizzle-orm';
import { db } from '~/database/db';
import { user } from '~/database/schema';

export async function getUsersToSendMail() {
  const list = await db.query.user.findMany({
    where: (fields, { sql, and, isNotNull }) => and(
      isNotNull(fields.email),
      sql`jsonb_path_query_first(settings, '$.enableNotification')::bool = true`
    ),
    columns: { email: true },
  });

  return list.map(v => v.email!);
}

export async function getUser(id: number) {
  const found = await db.query.user.findFirst({
    where: (fields, { eq }) => eq(fields.id, id),
  });

  return found;
}

export async function updateUser(id: number, data: Partial<typeof user.$inferInsert>) {
  await db.update(user)
    .set({
      settings: data.settings,
    })
    .where(sql`${user.id} = ${id}`);

  return true;
}