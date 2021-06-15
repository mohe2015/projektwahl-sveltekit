// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
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

	/*
SELECT * FROM users, LATERAL (WITH c AS (SELECT * FROM choices,projects WHERE choices.user_id = users.id AND choices.project_id = projects.id AND users.project_leader_id IS DISTINCT FROM projects.id AND users.age >= projects.min_age AND users.age <= projects.max_age)
SELECT * FROM c WHERE
(SELECT COUNT(*) FROM c WHERE rank = 1) = 1 AND
(SELECT COUNT(*) FROM c WHERE rank = 2) = 1 AND
(SELECT COUNT(*) FROM c WHERE rank = 3) = 1 AND
(SELECT COUNT(*) FROM c WHERE rank = 4) = 1 AND
(SELECT COUNT(*) FROM c WHERE rank = 5) = 1) t;
*/

	// now we need to add choices for users that don't have any

	return {};
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
