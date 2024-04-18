import { type Request, type Response } from 'express';
import { db } from '../database/db';

export default async function getAll(request: Request, response: Response) {
  const computers = await db.query.computer.findMany({
    columns: { laboratoryId: false },
  });

  return response.status(200).json({ computers });
}
