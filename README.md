# Inventário UFBA

## Instalação

- Install dependencies: `npm install`
- Run migrations:
   - If in `dev`, run: `npm run db:push`
   - If in `prod`, run: `npm run db:migrate`


## TODO

Higher Priority:
- Toggle to allow registration
- Groups / Labortaories

Low priority:
- change from serial to identity in db
- change from timestamp to timestampz (with timezone)


## Welcome to Remix + Vite!

📖 See the [Remix docs](https://remix.run/docs) and the [Remix Vite docs](https://remix.run/docs/en/main/future/vite) for details on supported features.

### Development

Run the Vite dev server:

```shellscript
npm run dev
```

### Deployment

First, build your app for production:

```sh
npm run build
```

Then run the app in production mode:

```sh
npm start
```

Now you'll need to pick a host to deploy it to.

#### DIY

If you're familiar with deploying Node applications, the built-in Remix app server is production-ready.

Make sure to deploy the output of `npm run build`

- `build/server`
- `build/client`
