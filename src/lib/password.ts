import { argon2id, hash } from 'argon2';

export async function hashPassword(password: string): Promise<string> {
	// https://datatracker.ietf.org/doc/html/draft-irtf-cfrg-argon2-13
	return await hash(password, {
		type: argon2id,
		timeCost: 3,
		memoryCost: 64 * 1024, // 64 MiB
		saltLength: 128 / 8, // 16
		hashLength: 256 / 8, // 32
		parallelism: 4
	});
}
