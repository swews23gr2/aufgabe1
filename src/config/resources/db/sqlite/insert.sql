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

-- "Konzeption und Realisierung eines aktiven Datenbanksystems"
-- "Verteilte Komponenten und Datenbankanbindung"
-- "Design Patterns"
-- "Freiburger Chorbuch"
-- "Maschinelle Lernverfahren zur Behandlung von Bonitätsrisiken im Mobilfunkgeschäft"
-- "Software Pioneers"

INSERT INTO student(id, version, vorname, nachname, geburstdatum, matrikel, email, studienfach, abschluss, homepage, erzeugt, aktualisiert) VALUES
    (1, 0, 'Oliver', 'Smith', '1995-07-12', 34921, 'john.doe@example.com', 'WIIB', 'BACHELOR', 'https://acme.at', '2022-02-01 00:00:00', '2022-02-01 00:00:00');
INSERT INTO student(id, version, vorname, nachname, geburstdatum, matrikel, email, studienfach, abschluss, homepage, erzeugt, aktualisiert) VALUES
    (20, 0, 'Emma', 'Johnson', '1988-11-26', 76845, 'alice.smith@example.org', 'IB', 'BACHELOR', 'https://acme.biz', '2022-02-02 00:00:00', '2022-02-02 00:00:00');
INSERT INTO student(id, version, vorname, nachname, geburstdatum, matrikel, email, studienfach, abschluss, homepage, erzeugt, aktualisiert) VALUES
    (30, 0, 'Liam', 'Williams', '2000-03-04', 12357, 'mike.jones@example.net', 'MIB', 'MASTER', 'https://acme.com', '2022-02-03 00:00:00','2022-02-03 00:00:00');
INSERT INTO student(id, version, vorname, nachname, geburstdatum, matrikel, email, studienfach, abschluss, homepage, erzeugt, aktualisiert) VALUES
    (40, 0, 'Ava', 'Davis', '1979-09-18', 98652, 'emily.wilson@example.com', 'WIIM', 'MASTER', 'https://acme.de', '2022-02-04 00:00:00', '2022-02-04 00:00:00');
INSERT INTO student(id, version, vorname, nachname, geburstdatum, matrikel, email, studienfach, abschluss, homepage, erzeugt, aktualisiert) VALUES
    (50, 0, 'Noah', 'Wilson', '1992-05-30', 54389, 'sarah.brown@example.biz', 'IM', 'BACHELOR', 'https://acme.es', '2022-02-05 00:00:00', '2022-02-05 00:00:00');
INSERT INTO student(id, version, vorname, nachname, geburstdatum, matrikel, email, studienfach, abschluss, homepage, erzeugt, aktualisiert) VALUES
    (60, 0, 'Sophia', 'Anderson', '1985-12-09', 21574, 'david.clark@example.info', 'WIWM', 'MASTER', 'https://acme.it', '2022-02-06 00:00:00', '2022-02-06 00:00:00');

INSERT INTO adresse(id, ort, plz, land, student_id) VALUES
    (1, 'New York', 12345, 'USA', 20);
INSERT INTO adresse(id, ort, plz, land, student_id) VALUES
    (20, 'Los Angeles', 45678, 'USA', 30);
INSERT INTO adresse(id, ort, plz, land, student_id) VALUES
    (30, 'Karlsruhe', 78912, 'GERMANY', 40);
INSERT INTO adresse(id, ort, plz, land, student_id) VALUES
    (40, 'Ontario', 10112, 'CANADA', 50);
INSERT INTO adresse(id, ort, plz, land, student_id) VALUES
    (50, 'Heidelberg', 24645, 'GERMANY', 60);
INSERT INTO adresse(id, ort, plz, land, student_id) VALUES
    (60, 'Quebec', 98555, 'CANADA', 1);

INSERT INTO fach(id, name, abkuerzung, student_id) VALUES
    (1, 'Mathematik 2', 'Mathe 2', 1);
INSERT INTO fach(id, name, abkuerzung, student_id) VALUES
    (20,'Anwendungsprojekt','AWP',20);
INSERT INTO fach(id, name, abkuerzung, student_id) VALUES
    (21,'Programmieren 2','Prog 2',30);
INSERT INTO fach(id, name, abkuerzung, student_id) VALUES
    (30,'Softwarearchitektur','SWA',30);
INSERT INTO fach(id, name, abkuerzung, student_id) VALUES
    (31,'Softwareengeneering','SWE',40);
INSERT INTO fach(id, name, abkuerzung, student_id) VALUES
    (40,'Kommunikationssysteme','KS',50);
INSERT INTO fach(id, name, abkuerzung, student_id) VALUES
    (50,'Produktionsorganisation','ProdOrg',50);
INSERT INTO fach(id, name, abkuerzung, student_id) VALUES
    (60,'Automatisierung von Geschäftsprozessen','AVG',60);
