/**
 * Das Modul besteht aus den Klassen {@linkcode NoTokenError} und
 * {@linkcode UserInvalidError} für die Fehlerbehandlung mit try-catch.
 * @packageDocumentation
 */

/* eslint-disable max-classes-per-file */

// Statt JWT zu implementieren, koennte man z.B. Passport verwenden

// http://stackoverflow.com/questions/1382107/whats-a-good-way-to-extend-error-in-javascript#answer-5251506
// https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/Error

/**
 * Die Klasse `NoTokenError` implementiert den Fehler, wenn es beim Request
 * keinen JSON Web Token gab.
 */
export class NoTokenError extends Error {
    constructor() {
        super('Es gibt keinen Token');
        this.name = 'NoTokenError';
        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this);
    }
}

/**
 * Die Klasse `UserInvalidError` implementiert den Fehler, dass es zwar beim
 * Request einen JSON Web Token gab, dass es aber keinen zugehörigen
 * [User](../interfaces/security_auth_service_user_service.User.html) gibt.
 */
export class UserInvalidError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'UserInvalidError';
        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this);
    }
}

/* eslint-enable max-classes-per-file */
