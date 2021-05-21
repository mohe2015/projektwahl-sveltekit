import { sql } from '$lib/database';

/**
 * @type {import('@sveltejs/kit').RequestHandler}
 */
export async function get({ params }) {
    // TODO FIXME don't provide all columns
	const users = await sql`SELECT * FROM users;`

    return {
        body: users
    };
}