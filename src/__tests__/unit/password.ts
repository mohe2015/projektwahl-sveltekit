// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import 'jest';
import { checkPassword, hashPassword } from '../../lib/password';

test('password library works', async () => {
	expect(await checkPassword(await hashPassword('pw'), 'pw')).toBeTruthy();
});
