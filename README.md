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

## Projeto
Recursos usados principais:
- Aplicação: Remix.run (+ `remix-flat-routes`)
- UI Components: shadcn/ui (que por sua vez usa Radix, Tailwind, React-Table, etc.)
- ORM: Drizzle

Orientações básicas
- Importante ler a documentação do Remix, para certos cuidados e boas práticas, como a separação de client-side e server-side.
- Páginas restritas dentro de `app/routes/_app+`
- Páginas livres e outros recursos, colocar em `app/routes`
- Componentes shadcn em `app/components/ui` e outros em `app/components`, assim como a navbar
- Em `dev`, evitar gerar muitas migrations, pode ser uma geração a cada deploy.

Remix Flat Routes
- `_abc` -> página abc sem adicionar o abc à url
- `abc_.xyz` -> página xyz sem o layout de abc
- `$id` -> parâmetros dinâmicos

## TODO

- detalhes: mais dados em formato de cards ao invés de json
- destaque para computadores com baixo espaço livre em disco

Baixa prioridade
- separar arquivos server-side numa pasta `.server`