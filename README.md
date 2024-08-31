# Inventário UFBA

## Instalação

- Install dependencies: `npm install`
- Run migrations:
   - If in `dev`, run: `npm run db:push`
   - If in `prod`, run: `npm run db:migrate`

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



## TODO

- detalhes: mais dados em formato de cards ao invés de json
- destaque para computadores com baixo espaço livre em disco
