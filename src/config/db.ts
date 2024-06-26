/**
 * Das Modul enthält die Konfiguration für den Zugriff auf die DB.
 * @packageDocumentation
 */
import { BASEDIR, config } from './app.js';
import { type DataSourceOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { Student } from '../student/entity/student.entity.js';
import { type TypeOrmModuleOptions } from '@nestjs/typeorm';
import { dbType } from './dbtype.js';
import { entities } from '../student/entity/entities.js';
import { loggerDefaultValue } from './logger.js';
import { nodeConfig } from './node.js';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const { db } = config;

// nullish coalescing
const database = (db?.name as string | undefined) ?? Student.name.toLowerCase();

const host = (db?.host as string | undefined) ?? 'localhost';
const username =
    (db?.username as string | undefined) ?? Student.name.toLowerCase();
const pass = (db?.password as string | undefined) ?? 'p';
const passAdmin = (db?.passwordAdmin as string | undefined) ?? 'p';

const namingStrategy = new SnakeNamingStrategy();

// logging bei TypeORM durch console.log()
const logging =
    (nodeConfig.nodeEnv === 'development' || nodeConfig.nodeEnv === 'test') &&
    !loggerDefaultValue;
const logger = 'advanced-console';

export const resourcesDir = resolve(nodeConfig.resourcesDir, 'db', dbType);

// TODO records als "deeply immutable data structure" (Stage 2)
// https://github.com/tc39/proposal-record-tuple
export let typeOrmModuleOptions: TypeOrmModuleOptions;
switch (dbType) {
    case 'postgres': {
        const cert = readFileSync(resolve(resourcesDir, 'certificate.cer')); // eslint-disable-line security/detect-non-literal-fs-filename
        typeOrmModuleOptions = {
            type: 'postgres',
            host,
            port: 5432,
            username,
            password: pass,
            database,
            entities,
            namingStrategy,
            logging,
            logger,
            ssl: { cert },
            extra: {
                ssl: {
                    rejectUnauthorized: false,
                },
            },
        };
        break;
    }
    case 'mysql': {
        const cert = readFileSync(resolve(resourcesDir, 'certificate.cer')); // eslint-disable-line security/detect-non-literal-fs-filename
        typeOrmModuleOptions = {
            type: 'mysql',
            host,
            port: 3306,
            username,
            password: pass,
            database,
            entities,
            namingStrategy,
            supportBigNumbers: true,
            logging,
            logger,
            ssl: { cert },
            extra: {
                ssl: {
                    rejectUnauthorized: false,
                },
            },
        };
        break;
    }
    // 'better-sqlite3' erfordert Python zum Uebersetzen, wenn das Docker-Image gebaut wird
    case 'sqlite': {
        const sqliteDatabase = resolve(
            BASEDIR,
            'config',
            'resources',
            'db',
            'sqlite',
            `${database}.sqlite`,
        );
        typeOrmModuleOptions = {
            type: 'sqlite',
            database: sqliteDatabase,
            entities,
            namingStrategy,
            logging,
            logger,
        };
        break;
    }
    default: {
        typeOrmModuleOptions = {
            type: 'postgres',
            host,
            port: 5432,
            username,
            password: pass,
            database,
            entities,
            logging,
            logger,
        };
        break;
    }
}
Object.freeze(typeOrmModuleOptions);

if (!loggerDefaultValue) {
    // "rest properties" ab ES 2018: https://github.com/tc39/proposal-object-rest-spread
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { password, ssl, ...typeOrmModuleOptionsLog } =
        typeOrmModuleOptions as any;
    console.debug('typeOrmModuleOptions: %o', typeOrmModuleOptionsLog);
}

export const dbPopulate = db?.populate === true;
export const adminDataSourceOptions: DataSourceOptions =
    dbType === 'mysql'
        ? {
              type: 'mysql',
              host,
              port: 3306,
              username: 'root',
              password: passAdmin,
              database,
              namingStrategy,
              supportBigNumbers: true,
              logging,
              logger,
          }
        : {
              type: 'postgres',
              host,
              port: 5432,
              username: 'postgres',
              password: passAdmin,
              database,
              schema: database,
              namingStrategy,
              logging,
              logger,
          };
