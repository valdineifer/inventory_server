import { type Request, type Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { db } from '../database/db';

export async function signin(request: Request, response: Response) {
  const validatorSchema = z.object({
    username: z.string(),
    password: z.string(),
  });

  const validated = validatorSchema.safeParse(request.body);

  if (!validated.success) {
    return response.status(400).json({ error: validated.error.errors[0] });
  }

  const { data } = validated;

  const user = await db.query.user.findFirst({
    where: (user, {eq}) => eq(user.username, data.username),
  });

  if (!user) {
    return response.status(401).json({ error: 'Invalid credentials' });
  }

  const isValidPassword = bcrypt.compareSync(data.password, user.password);

  if (!isValidPassword) {
    return response.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username },
    process.env.SECRET_KEY!,
    { expiresIn: '7d' },
  );
  
  return response.status(200).send({ token });
}
