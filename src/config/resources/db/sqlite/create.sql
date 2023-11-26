-- Copyright (C) 2023 - present Juergen Zimmermann, Hochschule Karlsruhe
--
-- This program is free software: you can redistribute it and/or modify
-- it under the terms of the GNU General Public License as published by
-- the Free Software Foundation, either version 3 of the License, or
-- (at your option) any later version.
--
-- This program is distributed in the hope that it will be useful,
-- but WITHOUT ANY WARRANTY; without even the implied warranty of
-- MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
-- GNU General Public License for more details.
--
-- You should have received a copy of the GNU General Public License
-- along with this program.  If not, see <https://www.gnu.org/licenses/>.

-- https://docs.python.org/dev/library/sqlite3.html#sqlite3-cli
-- sqlite3 patient.sqlite

-- https://sqlite.org/lang_createtable.html
-- https://sqlite.org/stricttables.html ab 3.37.0
-- https://sqlite.org/syntax/column-constraint.html
-- https://sqlite.org/autoinc.html
-- https://sqlite.org/stricttables.html: INT, INTEGER, REAL, TEXT
-- https://sqlite.org/lang_createindex.html
-- https://stackoverflow.com/questions/37619526/how-can-i-change-the-default-sqlite-timezone

CREATE TABLE IF NOT EXISTS student (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    version        INTEGER NOT NULL DEFAULT 0,
    vorname        TEXT NOT NULL,
    nachname       TEXT NOT NULL,
    geburtsdatum   TEXT,
    matrikel       INTEGER NOT NULL,
    email          TEXT,
    studienfach    TEXT,
    abschluss      TEXT CHECK (abschluss == 'BACHELOR' or abschluss == 'MASTER'),
    homepage       TEXT,
    erzeugt        TEXT NOT NULL,
    aktualisiert   TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS student_matrikel_idx ON student(matrikel);

CREATE TABLE IF NOT EXISTS adresse (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    ort         TEXT,
    plz         TEXT,
    land        TEXT,
    student_id  INTEGER NOT NULL UNIQUE REFERENCES student
);


CREATE TABLE IF NOT EXISTS fach (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    name            TEXT NOT NULL,
    abkuerzung      TEXT NOT NULL,
    student_id      INTEGER NOT NULL REFERENCES student
);
CREATE INDEX IF NOT EXISTS fach_student_id_idx ON fach(student_id);
