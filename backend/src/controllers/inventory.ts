import { type Request, type Response } from 'express';
import { z } from 'zod';
import { db } from '../database/db';
import { computer } from '../database/schema';

export default async function inventory(request: Request, response: Response) {
  const validatorSchema = z.object({
    hostname: z.string(),
    mac: z.string(),
    laboratoryCode: z.string().optional(),
  });

  const validated = validatorSchema.safeParse(request.body);

  if (!validated.success) {
    response.status(400).json({ error: validated.error.message });
  }

  const lab = await db.query.laboratory.findFirst({
    columns: {id: true},
    where: (laboratory, { eq }) => eq(laboratory.code, request.body.laboratoryCode)
  });

  const insertValues = {
    mac: request.body.mac,
    ip: request.body.ip,
    laboratoryId: lab?.id,
    info: request.body.info,
  };

  const [inserted] = await db.insert(computer).values(insertValues)
    .returning({ id: computer.id });

  return inserted;
}
