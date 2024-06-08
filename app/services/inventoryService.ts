import { json } from '@remix-run/node';
import { eq } from 'drizzle-orm';
import { db } from '~/database/db';
import { computer, computerLog, laboratory } from '~/database/schema';

type ComputerInsert = typeof computer.$inferInsert & {
  info: any; // eslint-disable-line @typescript-eslint/no-explicit-any
};

export async function inventory(data: ComputerInsert) {
  if (data.info?.laboratoryCode) {
    const lab = await db.query.laboratory.findFirst({
      columns: { id: true },
      where: (laboratory, { eq }) => eq(laboratory.code, data.info.laboratoryCode)
    });

    if (lab) {
      data.laboratoryId = lab.id;
    } else {
      const [{ id }] = await db.insert(laboratory).values({
        code: data.info.laboratoryCode,
      }).returning({ id: laboratory.id });

      data.laboratoryId = id;
    }
  }

  const existingComputer = await db.query.computer.findFirst({
    where: (computer, { eq }) => eq(computer.mac, data.mac),
  });

  if (existingComputer) {
    const [updated] = await db.update(computer)
      .set({
        name: data.info.hostname,
        info: data.info,
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

  const [inserted] = await db.insert(computer).values(data)
    .returning({ id: computer.id });

  return json(inserted, 201);
}