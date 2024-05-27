import bcryptjs from 'bcryptjs';
import { z } from 'zod';
import { db } from '~/database/db';
import jwt from 'jsonwebtoken';

export async function validateCredentials(params: {username?: string, password?: string}): Promise<string> {
  const validatorSchema = z.object({
    username: z.string(),
    password: z.string(),
  });

  const validated = validatorSchema.safeParse(params);

  if (!validated.success) {
    throw new Error(validated.error.errors[0].message);
  }

  const { data } = validated;

  const user = await db.query.user.findFirst({
    where: (user, {eq}) => eq(user.username, data.username),
  });

  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isValidPassword = bcryptjs.compareSync(data.password, user.password);

  if (!isValidPassword) {
    throw new Error('Invalid credentials');
  }

  const token = jwt.sign(
    { id: user.id, username: user.username },
    process.env.SECRET_KEY!,
    { expiresIn: '7d' },
  );
  
  return token;
}