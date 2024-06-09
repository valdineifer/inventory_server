import { createCookieSessionStorage } from '@remix-run/node';

type SessionData = {
  token: string;
};

type SessionFlashData = {
  error: string;
};

export const { getSession, commitSession, destroySession } =
  createCookieSessionStorage<SessionData, SessionFlashData>(
    {
      // a Cookie from `createCookie` or the CookieOptions to create one
      cookie: {
        name: '__session',

        // all of these are optional
        domain: 'remix.run',
        // Expires can also be set (although maxAge overrides it when used in combination).
        // Note that this method is NOT recommended as `new Date` creates only one date on each server deployment, not a dynamic date in the future!
        //
        // expires: new Date(Date.now() + 60_000),
        httpOnly: true,
        maxAge: 60,
        path: '/',
        sameSite: 'lax',
        secrets: [process.env.SECRET_KEY!],
        secure: true,
      },
    }
  );

export function getSessionFromRequest(request: Request) {
  // Gets the cookie header from the request
  const cookie = request.headers.get('Cookie');
  // Gets our session using the instance we defined above to get the session
  // information
  return getSession(cookie);
}