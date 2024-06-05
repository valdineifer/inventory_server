import type { ActionFunctionArgs } from '@remix-run/node'; // or cloudflare/deno
import { json } from '@remix-run/node'; // or cloudflare/deno
import { eq } from 'drizzle-orm';
import z from 'zod';
import { db } from '~/database/db';
import { computer, computerLog, laboratory } from '~/database/schema';

type ComputerInsert = typeof computer.$inferInsert;

export const action = async ({
  request,
}: ActionFunctionArgs) => {
  if (request.method !== 'POST') {
    return json({ message: 'Method not allowed' }, 405);
  }

  let payload;

  try {
    payload = await request.json();
  } catch (error) {
    const details = error instanceof Error ? error.message : '';
    return json({ error: 'Invalid JSON payload', details }, 400);
  }

  const validatorSchema = z.object({
    hostname: z.string(),
    mac: z.string(),
    laboratoryCode: z.string().optional(),
  }).catchall(z.any());

  const validated = validatorSchema.safeParse(payload);

  if (!validated.success) {
    return json({ error: validated.error.errors[0] }, 400);
  }

  const { data } = validated;

  const insertValues: ComputerInsert = {
    mac: data.mac,
    name: data.hostname,
    info: data,
    laboratoryId: undefined,
  };

  if (data.laboratoryCode) {
    const lab = await db.query.laboratory.findFirst({
      columns: {id: true},
      where: (laboratory, { eq }) => eq(laboratory.code, data.laboratoryCode!)
    });

    if (lab) {
      insertValues.laboratoryId = lab.id;
    } else {
      const [{ id }] = await db.insert(laboratory).values({
        code: data.laboratoryCode,
      }).returning({ id: laboratory.id });

      insertValues.laboratoryId = id;
    }
  }

  const existingComputer = await db.query.computer.findFirst({
    where: (computer, { eq }) => eq(computer.mac, data.mac),
  });

  if (existingComputer) {
    const [updated] = await db.update(computer)
      .set({
        name: data.hostname,
        info: data,
        updatedAt: new Date(),
      })
      .where(eq(computer.id, existingComputer.id))
      .returning({
        id: computer.id,
        mac: computer.mac,
      });

    await db.insert(computerLog).values({
      computerId: existingComputer.id,
      oldObject: existingComputer.info,
    }).returning({ id: computerLog.id });

    return json(updated);
  }

  const [inserted] = await db.insert(computer).values(insertValues)
    .returning({ id: computer.id });

  return json(inserted, 201);
};