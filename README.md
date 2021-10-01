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
echo "EXPLAIN (ANALYZE, COSTS, VERBOSE, BUFFERS, FORMAT JSON) " | psql -p 54321 -h localhost -U projektwahl > analyze.json
# https://explain.dalibo.com/
EXPLAIN ANALYZE SELECT id,name,type FROM users ORDER BY id ASC,name ASC LIMIT (10 + 1); # why sorted after name
# https://www.postgresql.org/docs/current/runtime-config-query.html

-- TODO FIXME OPTIMIZE THIS KIND OF QUERY BY UNION-ing the parts together and also only ordering the id field
-- ALSO TEST IF THIS IS ACTUALLY FASTER
EXPLAIN ANALYZE SELECT id,name,type FROM users WHERE (('user0.94651659117602724' < name) OR ('user0.94651659117602724' = name AND 'voter' < type) OR ('user0.94651659117602724' = name AND 'voter' = type AND '0655c7e4-cc6a-4013-a0a5-d18b7ff48e44' < id) OR (NOT true AND NOT false)) AND name LIKE '%%' AND (true OR id = null) ORDER BY name ASC,type ASC,id ASC LIMIT (10 + 1);

EXPLAIN ANALYZE SELECT id,name,type FROM users WHERE ('user0.94651659117602724' < name) OR ('user0.94651659117602724' = name AND 'voter' < type) OR ('user0.94651659117602724' = name AND 'voter' = type AND '0655c7e4-cc6a-4013-a0a5-d18b7ff48e44' < id) ORDER BY name ASC,type ASC,id ASC LIMIT (10 + 1);

TODO

TODO FIXME THE ORDER OF THE UNIONS HERE IS WRONG AND MAY ALSO NEED TO BE ADJUSTED FOR BACKWARDS PAGINATION

EXPLAIN ANALYZE
(SELECT id,name,type FROM users WHERE ('user0.94651659117602724' < name) ORDER BY name ASC,type ASC,id ASC LIMIT (10 + 1))
UNION ALL
(SELECT id,name,type FROM users WHERE ('user0.94651659117602724' = name AND 'voter' < type) ORDER BY name ASC,type ASC,id ASC LIMIT (10 + 1))
UNION ALL
(SELECT id,name,type FROM users WHERE ('user0.94651659117602724' = name AND 'voter' = type AND '0655c7e4-cc6a-4013-a0a5-d18b7ff48e44' < id) ORDER BY name ASC,type ASC,id ASC LIMIT (10 + 1))
LIMIT 11;



EXPLAIN ANALYZE SELECT id,name,type FROM users WHERE ROW('user0.94651659117602724', 'voter', '0655c7e4-cc6a-4013-a0a5-d18b7ff48e44') < ROW(name, type, id) ORDER BY name ASC,type ASC,id ASC LIMIT (10 + 1);


OTHER ONE:

SELECT id,name,type FROM users WHERE ('user0.0033005226067721605' < name) OR ('user0.0033005226067721605' = name AND 'c7821916-0e40-4459-8746-2ad6bde37700' > id) ORDER BY name ASC,id DESC LIMIT (10 + 1);



SELECT id,name,type FROM users WHERE ('user0.94651659117602724' < name) OR ('user0.94651659117602724' = name AND 'c7821916-0e40-4459-8746-2ad6bde37700' > id) ORDER BY name ASC,id DESC LIMIT (10 + 1);

in AND umschreiben?


mit tricks in ROW umschreiben:

CREATE INDEX users_type_index ON users (type);

sure, das wird jetzt natürlich nen seq scan, weil type...
EXPLAIN ANALYZE SELECT id,name,type FROM users WHERE ROW(type, 'user0.04651659117602724', id) < ROW('wter', name, '0655c7e4-cc6a-4013-a0a5-d18b7ff48e44') ORDER BY type DESC, name ASC,id DESC LIMIT (10 + 1);


slow:
EXPLAIN ANALYZE SELECT id,name,type FROM users WHERE ROW(type, 'user0.04651659117602724', id) < ROW('voter', name, '0655c7e4-cc6a-4013-a0a5-d18b7ff48e44') ORDER BY type DESC, name ASC,id DESC LIMIT (10 + 1);
30ms

can this be improved? maybe with an and query or union?


this works AND IS THE FASTEST:

EXPLAIN ANALYZE
(SELECT name,type FROM users WHERE ('voter' = type AND 'user0.04651659117602724' = name AND '0655c7e4-cc6a-4013-a0a5-d18b7ff48e44' > id) ORDER BY type DESC, name ASC,id DESC LIMIT (10 + 1))
UNION ALL
(SELECT name,type FROM users WHERE ('voter' = type AND 'user0.04651659117602724' < name) ORDER BY type DESC, name ASC,id DESC LIMIT (10 + 1))
UNION ALL
(SELECT name,type FROM users WHERE ('voter' > type) ORDER BY type DESC, name ASC,id DESC LIMIT (10 + 1))
LIMIT 11;



maybe with AND:


EXPLAIN ANALYZE SELECT type,name FROM users WHERE ROW(type, 'user0.04651659117602724') < ROW('voter', name) ORDER BY type DESC, name ASC LIMIT (10 + 1);


EXPLAIN ANALYZE SELECT type,name FROM users WHERE type <= 'voter' AND (name >= 'user0.04651659117602724' OR type < 'voter') ORDER BY type DESC, name ASC LIMIT (10 + 1);


just for the trolls using INTERSECT

EXPLAIN ANALYZE
(SELECT type,name FROM users WHERE type <= 'voter')
INTERSECT ALL
(SELECT type,name FROM users WHERE (name >= 'user0.04651659117602724' OR type < 'voter'))
ORDER BY type DESC, name ASC LIMIT (10 + 1);



RESET ALL;
# docker run -it -e MARIADB_ALLOW_EMPTY_ROOT_PASSWORD=true -p 3306:3306 mariadb
# mysql -h 127.0.0.1 -u root
```

https://github.com/sveltejs/realworld

TODO FIXME https://datatracker.ietf.org/doc/html/draft-ietf-httpbis-rfc6265bis-02#section-5.3.7.1

# Reset database (looses all data)

psql -p 54321 -h localhost -U projektwahl --db postgres

```sql
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
