-- CREATE ROLE student LOGIN PASSWORD 'p';

CREATE DATABASE student;

GRANT ALL ON DATABASE student TO student;

-- CREATE TABLESPACE studentspace OWNER student LOCATION '/var/lib/postgresql/tablespace/student';
