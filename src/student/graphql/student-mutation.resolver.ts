// eslint-disable-next-line max-classes-per-file
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { IsInt, IsNumberString, Min } from 'class-validator';
import { UseFilters, /* UseGuards,*/ UseInterceptors } from '@nestjs/common';
import { type Adresse } from '../entity/adresse.entity.js';
import { type Fach } from '../entity/fach.entity.js';
import { HttpExceptionFilter } from './http-exception.filter.js';
import { type IdInput } from './student-query.resolver.js';
import { ResponseTimeInterceptor } from '../../logger/response-time.interceptor.js';
import { type Student } from '../entity/student.entity.js';
import { StudentDTO } from '../rest/studentDTO.entity.js';
import { StudentWriteService } from '../service/student-write.service.js';
// import { JwtAuthGraphQlGuard } from '../../security/auth/jwt/jwt-auth-graphql.guard.js';
// import { RolesAllowed } from '../../security/auth/roles/roles-allowed.decorator.js';
// import { RolesGraphQlGuard } from '../../security/auth/roles/roles-graphql.guard.js';
import { getLogger } from '../../logger/logger.js';

// Authentifizierung und Autorisierung durch
//  GraphQL Shield
//      https://www.graphql-shield.com
//      https://github.com/maticzav/graphql-shield
//      https://github.com/nestjs/graphql/issues/92
//      https://github.com/maticzav/graphql-shield/issues/213
//  GraphQL AuthZ
//      https://github.com/AstrumU/graphql-authz
//      https://www.the-guild.dev/blog/graphql-authz

export interface CreatePayload {
    readonly id: number;
}

export interface UpdatePayload {
    readonly version: number;
}

export class StudentUpdateDTO extends StudentDTO {
    @IsNumberString()
    readonly id!: string;

    @IsInt()
    @Min(0)
    readonly version!: number;
}
@Resolver()
// alternativ: globale Aktivierung der Guards https://docs.nestjs.com/security/authorization#basic-rbac-implementation
// @UseGuards(JwtAuthGraphQlGuard, RolesGraphQlGuard)
@UseFilters(HttpExceptionFilter)
@UseInterceptors(ResponseTimeInterceptor)
export class StudentMutationResolver {
    readonly #service: StudentWriteService;

    readonly #logger = getLogger(StudentMutationResolver.name);

    constructor(service: StudentWriteService) {
        this.#service = service;
    }

    @Mutation()
    // @RolesAllowed('admin', 'fachabteilung')
    async create(@Args('input') studentDTO: StudentDTO) {
        this.#logger.debug('create: studentDTO=%o', studentDTO);

        const student = this.#studentDtoToStudent(studentDTO);
        const id = await this.#service.create(student);
        // TODO BadUserInputError
        this.#logger.debug('createStudent: id=%d', id);
        const payload: CreatePayload = { id };
        return payload;
    }

    @Mutation()
    // @RolesAllowed('admin', 'fachabteilung')
    async update(@Args('input') studentDTO: StudentUpdateDTO) {
        this.#logger.debug('update: student=%o', studentDTO);

        const student = this.#studentUpdatetoToStudent(studentDTO);
        const versionStr = `"${studentDTO.version.toString()}"`;

        const versionResult = await this.#service.update({
            id: Number.parseInt(studentDTO.id, 10),
            student,
            version: versionStr,
        });
        // TODO BadUserInputError
        this.#logger.debug('updateStudent: versionResult=%d', versionResult);
        const payload: UpdatePayload = { version: versionResult };
        return payload;
    }

    @Mutation()
    // @RolesAllowed('admin')
    async delete(@Args() id: IdInput) {
        const idStr = id.id;
        this.#logger.debug('delete: id=%s', idStr);
        const result = await this.#service.delete(idStr);
        this.#logger.debug('deleteStudent: result=%s', result);
        return result;
    }

    #studentDtoToStudent(studentDTO: StudentDTO): Student {
        const adresseDTO = studentDTO.adresse;
        const adresse: Adresse = {
            id: undefined,
            ort: adresseDTO.ort,
            plz: adresseDTO.plz,
            land: adresseDTO.land,
            student: undefined,
        };
        const faecher = studentDTO.faecher?.map((fachDTO) => {
            const fach: Fach = {
                id: undefined,
                name: fachDTO.name,
                abkuerzung: fachDTO.abkuerzung,
                student: undefined,
            };
            return fach;
        });
        const student: Student = {
            id: undefined,
            version: undefined,
            vorname: studentDTO.vorname,
            nachname: studentDTO.nachname,
            geburstdatum: studentDTO.geburstdatum,
            matrikel: studentDTO.matrikel,
            email: studentDTO.email,
            studienfach: studentDTO.studienfach,
            abschluss: studentDTO.abschluss,
            homepage: studentDTO.homepage,
            adresse,
            faecher,
            erzeugt: undefined,
            aktualisiert: undefined,
        };

        // Rueckwaertsverweis
        student.adresse!.student = student;
        return student;
    }

    #studentUpdatetoToStudent(studentDTO: StudentUpdateDTO): Student {
        return {
            id: undefined,
            version: undefined,
            vorname: studentDTO.vorname,
            nachname: studentDTO.nachname,
            abschluss: studentDTO.abschluss,
            geburstdatum: studentDTO.geburstdatum,
            matrikel: studentDTO.matrikel,
            email: studentDTO.email,
            studienfach: studentDTO.studienfach,
            homepage: studentDTO.homepage,
            adresse: undefined,
            faecher: undefined,
            erzeugt: undefined,
            aktualisiert: undefined,
        };
    }

    // #errorMsgCreateBuch(err: CreateError) {
    //     switch (err.type) {
    //         case 'IsbnExists': {
    //             return `Die ISBN ${err.isbn} existiert bereits`;
    //         }
    //         default: {
    //             return 'Unbekannter Fehler';
    //         }
    //     }
    // }

    // #errorMsgUpdateBuch(err: UpdateError) {
    //     switch (err.type) {
    //         case 'BuchNotExists': {
    //             return `Es gibt kein Buch mit der ID ${err.id}`;
    //         }
    //         case 'VersionInvalid': {
    //             return `"${err.version}" ist keine gueltige Versionsnummer`;
    //         }
    //         case 'VersionOutdated': {
    //             return `Die Versionsnummer "${err.version}" ist nicht mehr aktuell`;
    //         }
    //         default: {
    //             return 'Unbekannter Fehler';
    //         }
    //     }
    // }
}
