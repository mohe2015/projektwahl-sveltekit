<!--
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
-->

```bash
nix develop
# TODO FIXME check that this is set - if we use it.
VITE_BASE_URL=http://localhost:3000/ npm run dev
http://localhost:3000/setup


psql -p 54321 -h localhost -U projektwahl
echo "EXPLAIN (ANALYZE, COSTS, VERBOSE, BUFFERS, FORMAT JSON) " | psql -p 54321 -h localhost -U projektwahl > analyze.json
# https://explain.dalibo.com/
EXPLAIN ANALYZE SELECT id,name,type FROM users ORDER BY id ASC,name ASC LIMIT (10 + 1); # why sorted after name
# https://www.postgresql.org/docs/current/runtime-config-query.html


RESET ALL;
# docker run -it -e MARIADB_ALLOW_EMPTY_ROOT_PASSWORD=true -p 3306:3306 mariadb
# mysql -h 127.0.0.1 -u root
```

https://github.com/sveltejs/realworld

TODO FIXME https://datatracker.ietf.org/doc/html/draft-ietf-httpbis-rfc6265bis-02#section-5.3.7.1

# Reset database (looses all data)

```sql
BEGIN READ WRITE;
DROP TABLE settings;
DROP TABLE sessions;
DROP TABLE choices;
DROP TABLE users;
DROP TABLE projects;
COMMIT;
```

# create-svelte

Everything you need to build a Svelte project, powered by [`create-svelte`](https://github.com/sveltejs/kit/tree/master/packages/create-svelte);

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```bash
# create a new project in the current directory
npm init svelte@next

# create a new project in my-app
npm init svelte@next my-app
```

> Note: the `@next` is temporary

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

Before creating a production version of your app, install an [adapter](https://kit.svelte.dev/docs#adapters) for your target environment. Then:

```bash
npm run build
```

> You can preview the built app with `npm run preview`, regardless of whether you installed an adapter. This should _not_ be used to serve your app in production.
