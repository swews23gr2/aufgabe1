import { type Abschluss, Student } from '../entity/student.entity.js';
import { Injectable, NotFoundException } from '@nestjs/common';
import { QueryBuilder } from './query-builder.js';
import RE2 from 're2';
import { getLogger } from '../../logger/logger.js';

export interface FindByIdParams {
    readonly id: number;
    readonly mitFaechern?: boolean;
}
export interface Suchkriterien {
    readonly vorname?: string;
    readonly nachname?: string;
    readonly matrikel?: number;
    readonly email?: string;
    readonly studienfach?: string;
    readonly abschluss?: Abschluss;
    readonly homepage?: string;
}

@Injectable()
export class StudentReadService {
    static readonly ID_PATTERN = new RE2('^[1-9][\\d]*$');

    readonly #studentProps: string[];

    readonly #queryBuilder: QueryBuilder;

    readonly #logger = getLogger(StudentReadService.name);

    constructor(queryBuilder: QueryBuilder) {
        const studentDummy = new Student();
        this.#studentProps = Object.getOwnPropertyNames(studentDummy);
        this.#queryBuilder = queryBuilder;
    }

    async findById({
        id,
        mitFaechern = false,
    }: FindByIdParams): Promise<Student> {
        this.#logger.debug('findById: id=%d', id);

        const student = await this.#queryBuilder
            .buildId({ id, mitFaechern })
            .getOne();
        if (student === null) {
            throw new NotFoundException(
                `Es gibt kein Student mit der ID ${id}.`,
            );
        }

        if (this.#logger.isLevelEnabled('debug')) {
            this.#logger.debug(
                'findById: student=%s, adresse=%o',
                student.toString(),
                student.adresse,
            );
            if (mitFaechern) {
                this.#logger.debug('findById: faecher=%o', student.faecher);
            }
        }
        return student;
    }

    async find(suchkriterien?: Suchkriterien) {
        this.#logger.debug('find: suchkriterien=%o', suchkriterien);

        // Keine Suchkriterien?
        if (suchkriterien === undefined) {
            return this.#queryBuilder.build({}).getMany();
        }
        const keys = Object.keys(suchkriterien);
        if (keys.length === 0) {
            return this.#queryBuilder.build(suchkriterien).getMany();
        }

        if (!this.#checkKeys(keys)) {
            throw new NotFoundException('Ungueltige Suchkriterien');
        }

        const studenten = await this.#queryBuilder
            .build(suchkriterien)
            .getMany();
        this.#logger.debug('find: faecher=%o', studenten);
        if (studenten.length === 0) {
            throw new NotFoundException(
                `Keine Faecher gefunden: ${JSON.stringify(suchkriterien)}`,
            );
        }

        return studenten;
    }

    #checkKeys(keys: string[]) {
        let validKeys = true;
        keys.forEach((key) => {
            if (!this.#studentProps.includes(key)) {
                this.#logger.debug(
                    '#find: ungueltiges Suchkriterium "%s"',
                    key,
                );
                validKeys = false;
            }
        });

        return validKeys;
    }
}
