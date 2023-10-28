import { Args, Query, Resolver } from '@nestjs/graphql';
import { UseFilters, UseInterceptors } from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter.js';
import { ResponseTimeInterceptor } from '../../logger/response-time.interceptor.js';
import { Student } from '../entity/student.entity.js';
import { StudentReadService } from '../service/student-read.service.js';
import { getLogger } from '../../logger/logger.js';

export interface IdInput {
    readonly id: number;
}

@Resolver((_: any) => Student)
@UseFilters(HttpExceptionFilter)
@UseInterceptors(ResponseTimeInterceptor)
export class StudentQueryResolver {
    readonly #service: StudentReadService;

    readonly #logger = getLogger(StudentQueryResolver.name);

    constructor(service: StudentReadService) {
        this.#service = service;
    }

    @Query('student')
    async findById(@Args() idInput: IdInput) {
        const { id } = idInput;
        this.#logger.debug('findById: id=%d', id);

        const student = await this.#service.findById({ id });

        if (this.#logger.isLevelEnabled('debug')) {
            this.#logger.debug('findById: student=%s', student.toString());
        }
        return student;
    }

    @Query('studenten')
    async find(@Args() adresse: { ort: string } | undefined) {
        const ortStr = adresse?.ort;
        this.#logger.debug('find: Suchkriterium ort=%s', ortStr);
        const suchkriterium = ortStr === undefined ? {} : { adresse: ortStr };

        const studenten = await this.#service.find(suchkriterium);

        this.#logger.debug('find: studenten=%o', studenten);
        return studenten;
    }
}
