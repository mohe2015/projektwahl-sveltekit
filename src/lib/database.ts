// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>

import postgres from 'postgres';
import dotenv from 'dotenv';

// TODO FIXME hack because VITE doesn't load all env vars
dotenv.config();

export const sql = postgres(process.env['DATABASE_URL']!, {
	debug: (connection, query, params) => {
		console.log(query);
		console.log(params);
	}
});
