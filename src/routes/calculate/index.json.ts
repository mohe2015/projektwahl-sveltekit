// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { sql } from '$lib/database';
import type { RequestHandler } from '@sveltejs/kit';
import type { MyLocals } from 'src/hooks';
import { mkdtemp, open } from 'fs/promises';
import { constants } from 'fs';
import path from 'path';
import os from 'os';
import { execFile } from 'child_process';

// https://neos-server.org/neos/cgi-bin/nph-neos-solver.cgi
// https://neos-server.org/neos/admin.html

export const get: RequestHandler<MyLocals, unknown> = async function (request) {
	// maybe store rank as binary bitfield so every bit represents a rank. then we can sum and compare the count of the summed values and the sum = 0b11111
	// bit-wise encoding of ranks and then compare with 0b11111

	const dir = await mkdtemp(path.join(os.tmpdir(), 'projektwahl-'));
	const filePath = path.join(dir, 'data.dat');
	const fileHandle = await open(
		filePath,
		constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL,
		0o600
	);

	await sql.begin(async (sql) => {
		// transaction guarantees consistent view of data

		const projects = await sql`SELECT id, min_participants, max_participants FROM projects;`;

		fileHandle.write(`data;${os.EOL}`);
		fileHandle.write(`set P :=`);
		projects.forEach((p) => {
			fileHandle.write(` project${p.id}`);
		});
		fileHandle.write(`;${os.EOL}`);

		const users = await sql`SELECT id, project_leader_id FROM users;`;

		fileHandle.write(`set U :=`);
		users.forEach((p) => {
			fileHandle.write(` user${p.id}`);
		});
		fileHandle.write(`;${os.EOL}`);

		fileHandle.write(`param project_leaders`);
		users.forEach((p) => {
			fileHandle.write(
				` [user${p.id}] ${p.project_leader_id ? `project${p.project_leader_id}` : `null`}`
			);
		});
		fileHandle.write(`;${os.EOL}`);

		fileHandle.write(`param projects : min_participants max_participants :=${os.EOL}`);
		projects.forEach((p) => {
			fileHandle.write(`project${p.id} ${p.min_participants} ${p.max_participants}${os.EOL}`);
		});
		fileHandle.write(`;${os.EOL}`);

		// TODO FIXME check random assignments allowed

		// TODO FIXME filter aways and filter type=voter
		const choices = await sql.file('src/lib/calculate.sql', undefined!, {
			cache: false // TODO FIXME doesnt seem to work properly
		});

		fileHandle.write(`param choices`);
		choices.forEach((p) => {
			fileHandle.write(` [user${p.user_id}, project${p.project_id}] ${p.rank}`);
		});
		fileHandle.write(`;${os.EOL}`);

		fileHandle.write(`end;${os.EOL}`);
	});

	//await unlink(filePath);

	await fileHandle.close();

	console.log(filePath);

	try {
		const childProcess = execFile(
			'glpsol',
			['--math', 'src/lib/calculate.mod', '--data', filePath],
			{}
		);

		for await (const chunk of childProcess.stdout!) {
			console.log(chunk);
		}

		for await (const chunk of childProcess.stderr!) {
			console.error(chunk);
		}

		const exitCode = await new Promise((resolve, reject) => {
			childProcess.on('close', resolve);
		});

		console.log(exitCode);
	} catch (error) {
		console.log(error);
	}

	return {
		body: {}
	};
};

// https://ampl.com/products/solvers/open-source/
// GLPK should also have ampl support

// TODO https://github.com/coin-or/Cbc
// probably need to package with AMPL support

// docker pull coinor/coinor-optimization-suite
// https://github.com/NixOS/nixpkgs/blob/8284fc30c84ea47e63209d1a892aca1dfcd6bdf3/pkgs/development/libraries/science/math/osi/default.nix

// https://en.wikipedia.org/wiki/List_of_optimization_software
// MPS, CPLEX LP: GLPK http://www.gnu.org/software/glpk/
// MPS, LP (!= CPLEX LP): LP_Solve http://lpsolve.sourceforge.net/5.5/ http://sourceforge.net/projects/lpsolve/
// https://github.com/coin-or/Cbc
// many including MPS: https://www.scipopt.org/doc/html/group__FILEREADERS.php https://www.scipopt.org/
// TODO OSSolverService https://www.coin-or.org/OS/documentation/node61.html

// https://neos-server.org/neos/solvers/index.html
// https://en.wikipedia.org/wiki/AMPL

// https://www.coin-or.org/downloading/
// https://hub.docker.com/r/coinor/coin-or-optimization-suite
