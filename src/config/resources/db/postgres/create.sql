-- Copyright (C) 2022 - present Juergen Zimmermann, Hochschule Karlsruhe
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

-- docker compose exec postgres bash
-- psql --dbname=buch --username=buch --file=/scripts/create-table-buch.sql

CREATE SCHEMA IF NOT EXISTS AUTHORIZATION student;

ALTER ROLE student SET search_path = 'student';

CREATE TYPE abschluss AS ENUM ('BACHELOR', 'MASTER');

CREATE TABLE IF NOT EXISTS student (
    id            integer GENERATED ALWAYS AS IDENTITY(START WITH 1000) PRIMARY KEY USING INDEX TABLESPACE studentspace,
                  
    version       integer NOT NULL DEFAULT 0,
    vorname       varchar(255),
    nachname       varchar(255),
    geburtsdatum  timestamp,
    matrikel      integer NOT NULL UNIQUE,
    email         varchar(255),
    studienfach   varchar(255),
    abschluss     varchar(255),
    homepage      varchar(255),
    erzeugt       timestamp NOT NULL DEFAULT NOW(),
    aktualisiert  timestamp NOT NULL DEFAULT NOW()
) TABLESPACE studentspace;

CREATE TABLE IF NOT EXISTS adresse (
    id          integer GENERATED ALWAYS AS IDENTITY(START WITH 1000) PRIMARY KEY USING INDEX TABLESPACE studentspace,
    ort         varchar(40) NOT NULL,
    plz         varchar(40),
    land        varchar(50),
    student_id  integer NOT NULL UNIQUE USING INDEX TABLESPACE studentspace REFERENCES student
) TABLESPACE studentspace;


CREATE TABLE IF NOT EXISTS fach (
    id              integer GENERATED ALWAYS AS IDENTITY(START WITH 1000) PRIMARY KEY USING INDEX TABLESPACE studentspace,
    name            varchar(255) NOT NULL,
    abkuerzung      varchar(255) NOT NULL,
    student_id      integer NOT NULL REFERENCES student
) TABLESPACE studentspace;

CREATE INDEX IF NOT EXISTS fach_student_id_idx ON fach(student_id) TABLESPACE studentspace;