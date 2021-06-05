// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import type { ServerRequest } from '@mohe2015/kit/types/hooks';
import type { JSONValue } from '@mohe2015/kit/types/endpoint';

export type MyEndpointOutput<Body extends string | Uint8Array | JSONValue> = {
	status?: number;
	headers?: Partial<Headers>;
	body?: Body;
};

export type MyRequestHandler<
	OutputBody extends string | Uint8Array | JSONValue,
	Locals = unknown,
	Body = unknown
> = (request: ServerRequest<Locals, Body>) => Promise<MyEndpointOutput<OutputBody>>;
