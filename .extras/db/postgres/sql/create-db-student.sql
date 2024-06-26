-- (1) in .extras\compose\db\postgres\compose.yml auskommentieren:
--        Zeile mit "command:" und nachfolgende Listenelemente mit führendem "-" auskommentieren
--            damit der PostgreSQL-Server ohne TLS gestartet wird
--        bei den Listenelemente unterhalb von "volumes:" die Zeilen mit "read_only:" bei private-key.pem und certificate.cer auskommentieren
--            damit die Zugriffsrechte fuer den privaten Schluessel und das Zertifikat gesetzt werden koennen
--        Zeile mit "user:" auskommentieren
--            damit der PostgreSQL-Server implizit mit dem Linux-User "root" gestartet wird
--     in .extras\compose\db\postgres\postgres.env auskommentieren:
--        Zeile mit "POSTGRES_HOST_AUTH_METHOD" auskommentieren
-- (2) PowerShell:
--     cd .extras\compose\db\postgres
--     docker compose up db
-- (3) 2. PowerShell:
--     cd .extras\compose\db\postgres
--     docker compose exec db bash
--        chown postgres:postgres /var/lib/postgresql/tablespace
--        chown postgres:postgres /var/lib/postgresql/tablespace/student
--        chown postgres:postgres /var/lib/postgresql/private-key.pem
--        chown postgres:postgres /var/lib/postgresql/certificate.cer
--        chmod 600 /var/lib/postgresql/private-key.pem
--        chmod 600 /var/lib/postgresql/certificate.cer
--        exit
--     docker compose down
-- (3) in compose.yml die obigen Kommentare wieder entfernen, d.h.
--        PostgreSQL-Server mit TLS starten
--        private-key.pem und certificate.cer als readonly
--        den Linux-User "postgres" wieder aktivieren
--     in postgres.env die obigen Kommentare wieder entfernen, d.h.
--        POSTGRES_HOST_AUTH_METHOD wieder aktivieren
-- (4) 1. PowerShell:
--     docker compose up db
-- (5) 2. PowerShell:
--     docker compose exec db bash
--        psql --dbname=postgres --username=postgres --file=/sql/create-db-student.sql
--        psql --dbname=student --username=student --file=/sql/create-schema-student.sql
--        exit
--      docker compose down

-- TLS fuer den PostgreSQL-Server mit OpenSSL in einer PowerShell ueberpruefen:
-- openssl s_client -connect localhost:5432 -starttls postgres
--
--  Erlaeuterung:
--      "openssl s_client": baut eine Verbindung ohne Verschlüsselung auf (hier: Rechner localhost mit Port 5432)
--      "starttls postgres": Kommando STARTTLS wird zum Server gesendet für ein Upgrade
--                           zu einer sicheren bzw. verschlüsselten Verbindung,
--                           um danach ein "TLS Handshake" mit dem Protokoll "postgres" durchzuführen
--
-- Ausgabe:
-- * "Can't use SSL_get_servername": Server gehört zu mehreren Domains bei derselben IP-Adresse
-- * selbst-signiertes Zertifikat
-- * "Certificate chain" mit Distinguished Name: S(ubject), CN (Common Name), OU (Organizationl Unit), O(rganization),
--                                               L(ocation), ST(ate), C(ountry)
-- * "No client certificate CA names sent": der OpenSSL-Client hat keine "Certificate Authority" (CA) Namen gesendet
-- * Algorithmus (signing digest): SHA256
-- * Signatur-Typ: RSA-PSS
-- * "TLSv1.3, Cipher is TLS_AES_256_GCM_SHA384"
-- * Schluessellaenge 2048 Bit

CREATE ROLE student LOGIN PASSWORD 'p';

CREATE DATABASE student;

GRANT ALL ON DATABASE student TO student;

CREATE TABLESPACE studentspace OWNER student LOCATION '/var/lib/postgresql/tablespace/student';