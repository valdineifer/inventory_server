import { count, eq } from 'drizzle-orm';
import { db } from '~/.server/database/db';
import { laboratory } from '~/.server/database/schema';
import { Settings } from '~/types/models';

type LaboratoryInsertData = typeof laboratory.$inferInsert;

export async function listLaboratories() {
  const list = await db.query.laboratory.findMany();

  return list;
}

export async function createLaboratory(data: LaboratoryInsertData) {
  const [{ counter }] = await db.select({ counter: count() })
    .from(laboratory)
    .where(eq(laboratory.code, data.code!));

  if (counter) {
    throw new Error('Já existe um laboratório com o código informado');
  }

  const [created] = await db.insert(laboratory).values(data).returning();

  return created;
}

export async function updateLaboratory(data: LaboratoryInsertData) {
  if (!data.id) {
    throw new Error('Laboratory ID required');
  }

  const [updated] = await db.update(laboratory)
    .set({
      code: data.code,
      description: data.description,
      updatedAt: new Date(),
    })
    .where(eq(laboratory.id, data.id))
    .returning();

  return updated;
}

export async function getLaboratoryDetails(id: number) {
  const lab = await db.query.laboratory.findFirst({
    where: eq(laboratory.id, id),
    with: {
      computers: {
        columns: { info: false },
      },
    }
  });

  return lab;
}

export async function deleteLaboratory(id: number) {
  const [deleted] = await db.delete(laboratory).where(eq(laboratory.id, id)).returning();

  return deleted.id === id;
}

export async function getSettings(groupId: number): Promise<Settings> {
  let groupSettings;

  if (groupId) {
    groupSettings = await db.query.laboratory.findFirst({
      where: (fields, ops) => ops.eq(fields.id, groupId),
      columns: { settings: true },
    });
  }

  const settings = await db.query.settings.findFirst();

  return {
    ...settings?.value,
    ...groupSettings?.settings,
  };
}