// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>

import postgres from 'postgres';

export const sql = postgres('postgres://projektwahl:changeme@localhost:54321/projektwahl', {
	debug: true
});
