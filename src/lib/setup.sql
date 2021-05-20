BEGIN;

CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY NOT NULL,
  title VARCHAR(255) NOT NULL,
  info VARCHAR(4096) NOT NULL,
  place VARCHAR(256) NOT NULL,
  costs DECIMAL(4,2) NOT NULL,
  min_age INTEGER NOT NULL,
  max_age INTEGER NOT NULL,
  min_participants INTEGER NOT NULL,
  max_participants INTEGER NOT NULL,
  presentation_type VARCHAR(512) NOT NULL,
  requirements VARCHAR(1024) NOT NULL,
  random_assignments BOOLEAN NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY NOT NULL,
  name VARCHAR(64) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  type VARCHAR(16) NOT NULL,
  project_leader_id UUID,
  class VARCHAR(8),
  age INTEGER,
  away BOOLEAN NOT NULL DEFAULT FALSE,
  password_changed BOOLEAN NOT NULL DEFAULT FALSE,
  in_project_id UUID,
  FOREIGN KEY (project_leader_id)
    REFERENCES projects(id)
    ON UPDATE RESTRICT
    ON DELETE RESTRICT,
  FOREIGN KEY (in_project_id)
    REFERENCES projects(id)
    ON UPDATE RESTRICT
    ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS choices (
  rank INTEGER NOT NULL,
  project_id UUID NOT NULL,
  user_id UUID NOT NULL,
  PRIMARY KEY(project_id,user_id),
  FOREIGN KEY (project_id)
    REFERENCES projects(id)
    ON UPDATE RESTRICT
    ON DELETE RESTRICT,
  FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON UPDATE RESTRICT
    ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS sessions (
  session_id UUID PRIMARY KEY NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
  user_id UUID NOT NULL,
  FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON UPDATE RESTRICT
    ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY,
  election_running BOOLEAN NOT NULL
);

DROP TRIGGER IF EXISTS trigger_check_choices_age;
CREATE TRIGGER trigger_check_choices_age
BEFORE INSERT ON choices
FOR EACH ROW
BEGIN
SELECT CASE WHEN     (SELECT min_age FROM projects WHERE id = NEW.project) > (SELECT age FROM users WHERE id = NEW.user)
        OR (SELECT max_age FROM projects WHERE id = NEW.project) < (SELECT age FROM users WHERE id = NEW.user) THEN
    RAISE(ABORT, 'Der Nutzer passt nicht in die Altersbegrenzung des Projekts!')
END;
END;

DROP TRIGGER IF EXISTS trigger_update_project_check_choices_age;
CREATE TRIGGER trigger_update_project_check_choices_age
BEFORE UPDATE ON projects
FOR EACH ROW
BEGIN
SELECT CASE WHEN (SELECT COUNT(*) FROM choices, users WHERE choices.project = NEW.id AND users.id = choices.user AND (users.age < NEW.min_age OR users.age > NEW.max_age)) > 0 THEN
    RAISE(ABORT, 'Geänderte Altersbegrenzung würde Wahlen ungültig machen!')
END;
END;

DROP TRIGGER IF EXISTS trigger_check_project_leader_voted_own_project;
CREATE TRIGGER trigger_check_project_leader_voted_own_project BEFORE UPDATE ON users
FOR EACH ROW
BEGIN
SELECT CASE WHEN (SELECT COUNT(*) FROM choices WHERE choices.project = NEW.project_leader AND choices.user = NEW.id) > 0 THEN
    RAISE(ABORT, 'Nutzer kann nicht Projektleiter in einem Projekt sein, das er gewählt hat!')
END;
END;

DROP TRIGGER IF EXISTS trigger_check_project_leader_choices;
CREATE TRIGGER trigger_check_project_leader_choices BEFORE INSERT ON choices
FOR EACH ROW
BEGIN
SELECT CASE WHEN (SELECT COUNT(*) FROM users WHERE users.project_leader = NEW.project AND users.id = NEW.user) > 0 THEN
    RAISE(ABORT, 'Nutzer kann Projekt nicht wählen, in dem er Projektleiter ist!')
END;
END;

INSERT INTO settings (id, election_running) VALUES (1, false) ON CONFLICT DO NOTHING;

INSERT INTO users (name, password_hash, type) VALUES ('admin', ?, 'admin') ON CONFLICT DO NOTHING;

COMMIT;