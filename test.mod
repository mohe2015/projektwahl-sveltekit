# SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
# SPDX-License-Identifier: AGPL-3.0-or-later
# glpsol --math test.mod --data test.dat
# http://gusek.sourceforge.net/gmpl.pdf

set choices;

var test binary;

param cost {choices};
param user_in_project {choices} binary;

maximize total_cost: sum {j in choices} cost[j] * user_in_project[j];

# every user is in a project or is project leader
# if they don't vote they can get into any project
subject to 



# project not overfilled / underfilled