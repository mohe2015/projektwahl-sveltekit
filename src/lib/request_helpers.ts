// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import type { StrictBody } from '@sveltejs/kit/types/hooks';
import type { JSONValue } from '@sveltejs/kit/types/endpoint';
import type { Headers, ReadOnlyFormData } from '@sveltejs/kit/types/helper';

export type MyEndpointOutput<Body extends Uint8Array | JSONValue> = {
	status?: number;
	headers?: Partial<Headers>;
	body?: Body;
};
