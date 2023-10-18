CREATE TABLE student (
    id SERIAL PRIMARY KEY,
    version integer NOT NULL DEFAULT 0,
    vorname varchar(255),
    nachname varchar(255),
    geburstdatum timestamp,
    matrikel integer NOT NULL UNIQUE,
    email varchar(255),
    studienfach varchar(255),
    abschluss varchar(255),
    homepage varchar(255),
    erzeugt timestamp NOT NULL DEFAULT NOW(),
    aktualisiert timestamp NOT NULL DEFAULT NOW()
);

CREATE TABLE fach (
    id SERIAL PRIMARY KEY,
    name varchar(255),
    abkuerzung varchar(255),
    student_id integer REFERENCES student(id)
);

CREATE TABLE adresse (
    id SERIAL PRIMARY KEY,
    ort varchar(255),
    plz varchar(10),
    land varchar(50),
    student_id integer NOT NULL UNIQUE REFERENCES student(id)
);