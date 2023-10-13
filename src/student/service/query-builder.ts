import { Adresse } from '../entity/adresse.entity.js';
import { Fach } from '../entity/fach.entity.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Student } from '../entity/student.entity.js';
import { type Suchkriterien } from './student-read.service';
import { getLogger } from '../../logger/logger.js';
import { typeOrmModuleOptions } from '../../config/db.js';

export interface BuildIdParams {
    readonly id: number;
    readonly mitFaechern?: boolean;
}

@Injectable()
export class QueryBuilder {
    readonly #studentAlias = `${Student.name
        .charAt(0)
        .toLowerCase()}${Student.name.slice(1)}`;

    readonly #adresseAlias = `${Adresse.name
        .charAt(0)
        .toLowerCase()}${Adresse.name.slice(1)}`;

    readonly #fachAlias = `${Fach.name
        .charAt(0)
        .toLowerCase()}${Fach.name.slice(1)}`;

    readonly #repo: Repository<Student>;

    readonly #logger = getLogger(QueryBuilder.name);

    constructor(@InjectRepository(Student) repo: Repository<Student>) {
        this.#repo = repo;
    }

    buildId({ id, mitFaechern = false }: BuildIdParams) {
        const queryBuilder = this.#repo.createQueryBuilder(this.#studentAlias);
        queryBuilder.innerJoinAndSelect(
            `${this.#studentAlias}.adresse`,
            this.#adresseAlias,
        );
        if (mitFaechern) {
            queryBuilder.leftJoinAndSelect(
                `${this.#studentAlias}.faecher`,
                this.#fachAlias,
            );
        }
        queryBuilder.where(`${this.#studentAlias}.id = :id`, { id: id }); // eslint-disable-line object-shorthand
        return queryBuilder;
    }

    build({ abschluss, ...props }: Suchkriterien) {
        this.#logger.debug('build: abschluss=%s, props=%o', abschluss, props);

        let queryBuilder = this.#repo.createQueryBuilder(this.#studentAlias);
        queryBuilder.innerJoinAndSelect(
            `${this.#studentAlias}.abschluss`,
            'abschluss',
        );

        // type-coverage:ignore-next-line

        let useWhere = true;

        // type-coverage:ignore-next-line
        if (abschluss !== undefined) {
            const ilike =
                typeOrmModuleOptions.type === 'postgres' ? 'ilike' : 'like';
            queryBuilder = queryBuilder.where(
                `${this.#adresseAlias}.abschluss ${ilike} :abschluss`,
                { abschluss: `%${abschluss}%` },
            );
            useWhere = false;
        }

        Object.keys(props).forEach((key) => {
            const param: Record<string, any> = {};
            param[key] = (props as Record<string, any>)[key]; // eslint-disable-line @typescript-eslint/no-unsafe-assignment, security/detect-object-injection
            queryBuilder = useWhere
                ? queryBuilder.where(
                      `${this.#studentAlias}.${key} = :${key}`,
                      param,
                  )
                : queryBuilder.andWhere(
                      `${this.#studentAlias}.${key} = :${key}`,
                      param,
                  );
            useWhere = false;
        });

        this.#logger.debug('build: sql=%s', queryBuilder.getSql());
        return queryBuilder;
    }
}
