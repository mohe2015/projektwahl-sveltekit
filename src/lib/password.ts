// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { argon2id, hash, verify } from 'argon2';

const argon2Options = {
	type: argon2id,
	timeCost: 3,
	memoryCost: 64 * 1024, // 64 MiB
	saltLength: 128 / 8, // 16
	hashLength: 256 / 8, // 32
	parallelism: 4
};

export async function hashPassword(password: string): Promise<string> {
	// https://datatracker.ietf.org/doc/html/draft-irtf-cfrg-argon2-13
	return await hash(password, argon2Options);
}

export async function checkPassword(password: string, hash: string): Promise<boolean> {
	return await verify(hash, password, argon2Options);
}
