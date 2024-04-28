import { type Request, type Response } from 'express';
import { db } from '../database/db';
import { computer } from '../database/schema';
import { count } from 'drizzle-orm';

export async function getAll(request: Request, response: Response) {
  const computers = await db.query.computer.findMany({
    columns: { laboratoryId: false },
  });

  return response.status(200).json({ computers });
}

export async function countComputers(request: Request, response: Response) {
  const [{ value }] = await db.select({ value: count() }).from(computer);

  return response.status(200).json({ count: value });
}

export async function getComputer(request: Request, response: Response) {
  const id = Number(request.params.id);

  if (!id) {
    return response.status(400).json({ error: 'Invalid ID' });
  }

  const computer = await db.query.computer.findFirst({
    where: (computer, { eq }) => eq(computer.id, id),
  });

  if (!computer) {
    return response.status(404).json({ error: 'Computer not found' });
  }

  return response.status(200).json(computer);
}