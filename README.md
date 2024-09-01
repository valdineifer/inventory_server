# Inventário UFBA

## Instalação
- Instalação de dependências: `npm install`
- Rodar as migrations:
   - Em `dev`, run: `npm run db:push`
   - Em `prod`, npm irá rodar o mesmo comando que `npm run db:migrate` logo após a instação de dependências

### Deployment

Primeiro, faz o build da aplicação para produção:
```sh
npm run build
```

Para executar o app em modo produção, execute o npm script:
```sh
npm start
```

## TODO

- detalhes: mais dados em formato de cards ao invés de json
- destaque para computadores com baixo espaço livre em disco
