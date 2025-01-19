import bcryptjs from 'bcryptjs';
import { z } from 'zod';
import { db } from '~/.server/database/db';
import { createCookieSessionStorage } from '@remix-run/node';
import { Authenticator } from 'remix-auth';
import { FormStrategy } from 'remix-auth-form';

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: '__session', // use any name you want here
    sameSite: 'lax', // this helps with CSRF
    path: '/', // remember to add this so the cookie will work in all routes
    httpOnly: true, // for security reasons, make this cookie http only
    secrets: [process.env.SECRET_KEY!], // replace this with an actual secret
    secure: process.env.NODE_ENV === 'production', // enable this in prod only
  },
});

// Create an instance of the authenticator, pass a generic with what
// strategies will return and will store in the session
export const authenticator = new Authenticator<{ id: number, username: string }>(sessionStorage);

// Tell the Authenticator to use the form strategy
authenticator.use(
  new FormStrategy(async ({ form }) => {
    const username = form.get('username');
    const password = form.get('password');

    const user = await validateCredentials({
      username: typeof username === 'string' ? username : undefined,
      password: typeof password === 'string' ? password : undefined,
    });

    return user;
  }),
  'user-pass',
);

export async function validateCredentials(params: {username?: string, password?: string}) {
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
    where: (user, { eq }) => eq(user.username, data.username),
  });

  if (!user) {
    throw new Error('Credenciais inválidas');
  }

  const isValidPassword = bcryptjs.compareSync(data.password, user.password);

  if (!isValidPassword) {
    throw new Error('Credenciais inválidas');
  }

  return { id: user.id, username: user.username };
}

export async function validateToken(token: string|null) {
  if (!token) return false;

  const computer = await db.query.computer.findFirst({
    where: (computer, { eq }) => eq(computer.token, token),
  });

  if (!computer) return false;

  return true;
}