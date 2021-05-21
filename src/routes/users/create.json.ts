import { sql } from '$lib/database';
import type { RequestHandler } from '@sveltejs/kit';
import type { ServerRequest } from '@sveltejs/kit/types/endpoint';
import type { ReadOnlyFormData } from '@sveltejs/kit/types/helper';

/**
 * @type {import('@sveltejs/kit').RequestHandler}
 */
export async function post({ body }: ServerRequest<unknown, ReadOnlyFormData>) {
	
    // @ts-expect-error
    console.log([...body])

    return {
        body: {

        }
    }
}
