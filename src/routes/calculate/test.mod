# SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
# SPDX-License-Identifier: AGPL-3.0-or-later
# glpsol --math src/routes/calculate/test.mod
# --data test.dat
# http://gusek.sourceforge.net/gmpl.pdf

# project leaders

set U; # users

set P; # projects

set PA := {'min_participants', 'max_participants'};

# choices (if the user voted something the others get -1 then?)
param choices{u in U, p in P} integer;

param projects{p in P, pa in PA} integer;

param project_leaders{u in U};

var user_in_project{u in U, p in P} binary;

var user_is_project_leader{u in U} binary;

var project_not_exists{p in P} binary;

maximize total_cost: sum {u in U, p in P} if choices[u,p] != -1 then choices[u,p] * user_in_project[u,p];

subject to notinprojectyoudidntvote{u in U, p in P}:
    if choices[u,p] == -1 then user_in_project[u,p] = 0;

subject to onlyinoneproject{u in U}: (sum {p in P} user_in_project[u,p]) + user_is_project_leader[u] = 1;

# TODO FIXME projects not existing is also fine
# the project exists implementation is probably inefficient and could be rewritten as optionally subtract the amount of min participants / add the amount of max_participants
subject to project_min_size{p in P}: projects[p,'min_participants'] <= (sum {u in U} user_in_project[u,p]) - projects[p,'min_participants'] * project_not_exists[p];
subject to project_max_size{p in P}: (sum {u in U} user_in_project[u,p]) + projects[p,'max_participants'] * project_not_exists[p] <= projects[p,'max_participants'];

# every user is in a project or is project leader
# if they don't vote they can get into any project

# project not overfilled / underfilled

data;

set U := user0 user1 user2;

set P := project0 project1 project2;

param choices : project0 project1 project2 :=
user0           1        1       1
user1           0        1       0
user2           5        2       1         ;

param projects : min_participants max_participants :=
project0         1                1
project1         1                2
project2         2                5                ;

end;
