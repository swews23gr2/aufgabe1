import { Injectable, type OnApplicationBootstrap } from '@nestjs/common';
import { release, type, userInfo } from 'node:os';
import { dbType } from '../config/dbtype.js';
import figlet from 'figlet';
import { getLogger } from './logger.js';
import { hash } from 'argon2';
import { nodeConfig } from '../config/node.js';
import process from 'node:process';

@Injectable()
export class BannerService implements OnApplicationBootstrap {
    readonly #logger = getLogger(BannerService.name);

    async onApplicationBootstrap() {
        const { host, nodeEnv, port } = nodeConfig;
        figlet('Student Gruppe 2', (_, data) => console.info(data));
        this.#logger.info('Node: %s', process.version);
        this.#logger.info('NODE_ENV: %s', nodeEnv);
        this.#logger.info('Rechnername: %s', host);
        this.#logger.info('Port: %s', port);
        this.#logger.info('DB-System: %s', dbType);
        this.#logger.info('Betriebssystem: %s (%s)', type(), release());
        this.#logger.info('Username: %s', userInfo().username);

        const hashValue = await hash('p');
        this.#logger.debug('argon2id: p -> %s', hashValue);
    }
}
