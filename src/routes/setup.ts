import { setup } from '$lib/database';

/**
 * @type {import('@sveltejs/kit').RequestHandler}
 */
export async function get({ params }) {
	// the `slug` parameter is available because this file
	// is called [slug].json.js
	const { slug } = params;

	const article = await setup();

	if (article) {
		return {
			body: {
				article
			}
		};
	}
}