/**
 * Das Modul besteht aus der Funktion {@linkcode getLogger} für einen Logger auf
 * der Basis von Pino: https://getpino.io. Pino wird auch von Fastify genutzt.
 * Alternativen: Winston, log4js, Bunyan
 * @packageDocumentation
 */

import { type SonicBoom } from 'sonic-boom';
import { parentLogger } from '../config/logger.js';
import type pino from 'pino';

/**
 * Eine-Klasse, um ein Logger-Objekt von `Pino` zu erzeugen, so dass ein
 * _Kontext_ definiert wird, der bei jeder Log-Methode verwendet wird und i.a.
 * der Name einer eigenen Klasse ist.
 * @param context Der Kontext
 * @param kind i.a. `class`
 */
export const getLogger: (
    context: string,
    kind?: string,
) => pino.Logger<pino.ChildLoggerOptions & SonicBoom> = (
    context: string,
    kind = 'class',
) => {
    const bindings: Record<string, string> = {};
    // eslint-disable-next-line security/detect-object-injection
    bindings[kind] = context;
    return parentLogger.child(bindings);
};
