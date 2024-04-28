import { type Request, type Response } from 'express';
import { z } from 'zod';
import { db } from '../database/db';
import { computer, computer_log, laboratory } from '../database/schema';
import { eq } from 'drizzle-orm';

type ComputerInsert = typeof computer.$inferInsert;

export default async function inventory(request: Request, response: Response) {
  const validatorSchema = z.object({
    hostname: z.string(),
    mac: z.string(),
    ip: z.string(),
    laboratoryCode: z.string().optional(),
    info: z.object({
      hostname: z.string(),
    }),
  });

  const validated = validatorSchema.safeParse(request.body);

  if (!validated.success) {
    return response.status(400).json({ error: validated.error.message });
  }

  const { data } = validated;

  const insertValues: ComputerInsert = {
    mac: data.mac,
    name: data.info.hostname,
    info: data.info,
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
        name: data.info.hostname,
        info: data.info,
        updatedAt: new Date(),
      })
      .where(eq(computer.id, existingComputer.id))
      .returning({
        id: computer.id,
        mac: computer.mac,
      });

    await db.insert(computer_log).values({
      computerId: existingComputer.id,
      oldObject: existingComputer.info,
    }).returning({ id: computer_log.id });

    return updated;
  }
  
  const [inserted] = await db.insert(computer).values(insertValues)
    .returning({ id: computer.id });
  
  return inserted;
}
