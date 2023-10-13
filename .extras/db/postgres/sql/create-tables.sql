CREATE TABLE student (
    id SERIAL PRIMARY KEY,
    version INT,
    vorname VARCHAR(255),
    nachname VARCHAR(255),
    geburstdatum TIMESTAMP,
    matrikel INT,
    email VARCHAR(255),
    studienfach VARCHAR(255),
    abschluss VARCHAR(255),
    homepage VARCHAR(255),
    erzeugt TIMESTAMP,
    aktualisiert TIMESTAMP
);

CREATE TABLE fach (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    abkuerzung VARCHAR(255),
    student_id INT REFERENCES student(id)
);

CREATE TABLE adresse (
    id SERIAL PRIMARY KEY,
    ort VARCHAR(255),
    plz VARCHAR(10),
    land VARCHAR(50)
);