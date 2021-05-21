import { sql } from '$lib/database';
import { assertBoolean, assertNotEmpty, assertOneOf } from '$lib/validation';
import type { RequestHandler } from '@sveltejs/kit';
import type { ServerRequest } from '@sveltejs/kit/types/endpoint';
import type { ReadOnlyFormData } from '@sveltejs/kit/types/helper';

/**
 * @type {import('@sveltejs/kit').RequestHandler}
 */
export async function post({ body }: ServerRequest<unknown, ReadOnlyFormData>) {
	const errors = {
        ...assertNotEmpty(body, "name"),
        ...assertOneOf(body, "type", ["voter", "helper", "admin"]),
        ...(body.get("type") === "voter" ? assertNotEmpty(body, "group") : {}),
        ...(body.get("type") === "voter" ? assertNotEmpty(body, "age") : {}),
        ...assertBoolean(body, "away")
    };

    // @ts-expect-error
    console.log([...body])

    return {
        body: errors
    }
}
