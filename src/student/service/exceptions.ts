// eslint-disable-next-line max-classes-per-file
import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Das Modul besteht aus den Klassen für die Fehlerbehandlung bei der Verwaltung
 * von Studenten, z.B. beim DB-Zugriff.
 * @packageDocumentation
 */

/**
 * Exception-Klasse für eine bereits existierende Matrikelnummer.
 */
export class MatrikelExistsException extends HttpException {
    constructor(readonly matrikel: number) {
        super(
            `Die Matrikelnummer ${matrikel} existiert bereits.`,
            HttpStatus.UNPROCESSABLE_ENTITY,
        );
    }
}

/**
 * Exception-Klasse für eine bereits existierende E-Mail-Adresse.
 */
export class EmailExistsException extends HttpException {
    constructor(readonly email: string) {
        super(
            `Die E-Mail-Adresse ${email} existiert bereits.`,
            HttpStatus.UNPROCESSABLE_ENTITY,
        );
    }
}

/**
 * Exception-Klasse für eine ungültige Versionsnummer beim Ändern.
 */
export class VersionInvalidException extends HttpException {
    constructor(readonly version: string | undefined) {
        super(
            `Die Versionsnummer ${version} ist ungueltig.`,
            HttpStatus.PRECONDITION_FAILED,
        );
    }
}

/**
 * Exception-Klasse für eine veraltete Versionsnummer beim Ändern.
 */
export class VersionOutdatedException extends HttpException {
    constructor(readonly version: number) {
        super(
            `Die Versionsnummer ${version} ist nicht aktuell.`,
            HttpStatus.PRECONDITION_FAILED,
        );
    }
}
