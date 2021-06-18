// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { sql } from '$lib/database';
import type { RequestHandler } from '@sveltejs/kit';
import type { MyLocals } from 'src/hooks';

export const get: RequestHandler<MyLocals, unknown> = async function (request) {
	// valid choices:
	// exactly one of first, second, ..., fifth
	// not the one you are project leader in

	// so handle this per user
	// maybe first filter out all invalid choices so create a view of valid choices?

	// for a specific user getting the valid choices:
	// SELECT * FROM choices,projects WHERE user_id = 1 AND choices.project_id = projects.id;
	// SELECT * FROM choices,users,projects WHERE user_id = 1 AND choices.user_id = users.id AND choices.project_id = projects.id;
	// SELECT * FROM choices,users,projects WHERE user_id = 1 AND choices.user_id = users.id AND choices.project_id = projects.id AND users.project_leader_id IS DISTINCT FROM projects.id AND users.age >= projects.min_age AND users.age <= projects.max_age;
	// now only count needs to be checked

	/*
WITH c AS (SELECT * FROM choices,users,projects WHERE user_id = 7 AND choices.user_id = users.id AND choices.project_id = projects.id AND users.project_leader_id IS DISTINCT FROM projects.id AND users.age >= projects.min_age AND users.age <= projects.max_age)
SELECT * FROM c WHERE
(SELECT COUNT(*) FROM c WHERE rank = 1) = 1 AND
(SELECT COUNT(*) FROM c WHERE rank = 2) = 1 AND
(SELECT COUNT(*) FROM c WHERE rank = 3) = 1 AND
(SELECT COUNT(*) FROM c WHERE rank = 4) = 1 AND
(SELECT COUNT(*) FROM c WHERE rank = 5) = 1;
*/

	// maybe add constraints again to database (then I don't think we need to check projects any more and this also makes this a lot cleaner)
	/*

// maybe store rank as binary bitfield so every bit represents a rank. then we can sum and compare the count of the summed values and the sum = 0b11111

SELECT * FROM users, LATERAL (WITH c AS (SELECT * FROM choices,projects WHERE choices.user_id = users.id AND choices.project_id = projects.id AND users.project_leader_id IS DISTINCT FROM projects.id AND users.age >= projects.min_age AND users.age <= projects.max_age)
SELECT * FROM c WHERE
(SELECT COUNT(*) FROM c WHERE rank = 1) = 1 AND
(SELECT COUNT(*) FROM c WHERE rank = 2) = 1 AND
(SELECT COUNT(*) FROM c WHERE rank = 3) = 1 AND
(SELECT COUNT(*) FROM c WHERE rank = 4) = 1 AND
(SELECT COUNT(*) FROM c WHERE rank = 5) = 1) t;
*/
	// 384ms

	// now as we have constraints
	/*
SELECT * FROM users, LATERAL (WITH c AS (SELECT * FROM choices WHERE choices.user_id = users.id)
SELECT * FROM c WHERE
(SELECT COUNT(*) FROM c WHERE rank = 1) = 1 AND
(SELECT COUNT(*) FROM c WHERE rank = 2) = 1 AND
(SELECT COUNT(*) FROM c WHERE rank = 3) = 1 AND
(SELECT COUNT(*) FROM c WHERE rank = 4) = 1 AND
(SELECT COUNT(*) FROM c WHERE rank = 5) = 1) t;
*/
	// now only 6 ms

	// TODO FIXME think about using an extra table for partial choices? (then we would need to move choices all the time though)

	/*
SELECT * FROM users, LATERAL (WITH c AS (SELECT * FROM choices WHERE choices.user_id = users.id)
SELECT * FROM c WHERE
(SELECT COUNT(*) FROM c) = 5) t;
*/ // bit-wise encoding of ranks and then compare with 0b11111

	// now we need to add choices for users that don't have any

	// not perfect (slower), but seems nicer
	// SELECT * FROM choices WHERE (SELECT COUNT(*) FROM choices AS c WHERE c.user_id = choices.user_id) = 5;

	// DOES THIS EVEN WORK?
	/*
SELECT * FROM users, LATERAL (SELECT * FROM choices WHERE choices.user_id = users.id AND (SELECT COUNT(*) FROM choices WHERE choices.user_id = users.id) = 5) AS b;


-- use this for now:
SELECT * FROM users, LATERAL (WITH c AS (SELECT * FROM choices WHERE choices.user_id = users.id)
SELECT * FROM c WHERE
(SELECT COUNT(*) FROM c) = 5) t;


*/

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
