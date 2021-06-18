// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { sql } from '$lib/database';
import type { RequestHandler } from '@sveltejs/kit';
import type { MyLocals } from 'src/hooks';

export const get: RequestHandler<MyLocals, unknown> = async function (request) {
	// maybe store rank as binary bitfield so every bit represents a rank. then we can sum and compare the count of the summed values and the sum = 0b11111
	// bit-wise encoding of ranks and then compare with 0b11111

	await sql.begin(async (sql) => {
		// transaction guarantees consistent view of data

		const choices = await sql.file('src/routes/calculate/calculate.sql', undefined!, {
			cache: false // TODO FIXME doesnt seem to work properly
		});

		const projects = await sql`SELECT * FROM projects;`;

		const project_leaders = await sql`SELECT * FROM users;`;
	});

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
