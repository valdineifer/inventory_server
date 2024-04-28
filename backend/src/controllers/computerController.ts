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