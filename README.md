<!--
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
-->

```bash
nix develop
# TODO FIXME check that this is set - if we use it.
// TODO FIXME store password instead or use a longer living token or use oauth so we can refresh this
PROJEKTWAHL_ADMIN_ACCESS_TOKEN=`curl --data "grant_type=password&username=admin&password=admin&client_secret=secret&client_id=admin-cli" http://localhost:8888/auth/realms/master/protocol/openid-connect/token | jq -r .access_token`

# set in .env - warning: the .env file is stupid - don't quote anything and don't use comments
THE_BASE_URL=http://localhost:3000/
DATABASE_URL=postgres://projektwahl:changeme@localhost:54321
DATABASE_NAME=projektwahl
OPENID_URL=http://localhost:8888/auth/realms/projektwahl
CLIENT_ID=projektwahl
CLIENT_SECRET=
OPENID_ADMIN_URL=http://localhost:8888/auth/admin/realms/projektwahl/users

npm run dev
http://localhost:3000/setup

docker-compose stop
docker-compose rm db

psql -p 54321 -h localhost -U projektwahl
psql -p 54321 -h localhost -U projektwahl --db postgres
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
\c postgres
set default_transaction_read_only = false;
DROP DATABASE projektwahl;


BEGIN READ WRITE;
DROP TABLE IF EXISTS settings;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS choices;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS projects;
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
