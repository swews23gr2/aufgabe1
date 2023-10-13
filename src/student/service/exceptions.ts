// eslint-disable-next-line max-classes-per-file
import { HttpException, HttpStatus } from '@nestjs/common';

export class IsbnExistsException extends HttpException {
    constructor(readonly isbn: string) {
        super(
            `Die ISBN-Nummer ${isbn} existiert bereits.`,
            HttpStatus.UNPROCESSABLE_ENTITY,
        );
    }
}

export class VersionInvalidException extends HttpException {
    constructor(readonly version: string | undefined) {
        super(
            `Die Versionsnummer ${version} ist ungueltig.`,
            HttpStatus.PRECONDITION_FAILED,
        );
    }
}

export class VersionOutdatedException extends HttpException {
    constructor(readonly version: number) {
        super(
            `Die Versionsnummer ${version} ist nicht aktuell.`,
            HttpStatus.PRECONDITION_FAILED,
        );
    }
}
