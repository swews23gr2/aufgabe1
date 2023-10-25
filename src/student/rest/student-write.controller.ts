/**
 * Das Modul besteht aus der Controller-Klasse für Schreiben an der REST-Schnittstelle.
 * @packageDocumentation
 */

import { type Adresse } from '../entity/adresse.entity.js';
// eslint-disable-next-line sort-imports
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiCreatedResponse,
    ApiForbiddenResponse,
    ApiHeader,
    ApiNoContentResponse,
    ApiOperation,
    ApiPreconditionFailedResponse,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import {
    Body,
    Controller,
    Delete,
    Headers,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Put,
    Req,
    Res,
    // TODO: Security muss noch implementiert werden!
    //UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { StudentDTO, StudentDtoOhneRef } from './studentDTO.entity.js';
// eslint-disable-next-line sort-imports
import { Request, Response } from 'express';
import { type Fach } from '../entity/fach.entity.js';
import { type Student } from '../entity/student.entity.js';
import { StudentWriteService } from '../service/student-write.service.js';

// TODO: Security muss noch implementiert werden!
//import { JwtAuthGuard } from '../../security/auth/jwt/jwt-auth.guard.js';
// eslint-disable-next-line sort-imports
import { ResponseTimeInterceptor } from '../../logger/response-time.interceptor.js';
// TODO: Security muss noch implementiert werden!
//import { RolesAllowed } from '../../security/auth/roles/roles-allowed.decorator.js';
//import { RolesGuard } from '../../security/auth/roles/roles.guard.js';
import { getBaseUri } from './getBaseUri.js';
import { getLogger } from '../../logger/logger.js';
import { paths } from '../../config/paths.js';

const MSG_FORBIDDEN = 'Kein Token mit ausreichender Berechtigung vorhanden';

/**
 * Die Controller-Klasse für die Verwaltung von Studenten.
 */

@Controller(paths.rest)
// TODO: Security muss noch implementiert werden!
//@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(ResponseTimeInterceptor)
@ApiTags('Student REST-API')
@ApiBearerAuth()
export class StudentWriteController {
    readonly #service: StudentWriteService;

    readonly #logger = getLogger(StudentWriteController.name);

    constructor(service: StudentWriteService) {
        this.#service = service;
    }

    /**
     * Einen Student wird asynchron angelegt. Das neu anzulegender Student ist als
     * JSON-Datensatz im Request-Objekt enthalten. Wenn es keine
     * Verletzungen von Constraints gibt, wird der Statuscode `201` (`Created`)
     * gesetzt und im Response-Header wird `Location` auf die URI so gesetzt,
     * dass damit der neu angelegte Student abgerufen werden kann.
     *
     * Falls Constraints verletzt sind, wird der Statuscode `400` (`Bad Request`)
     * gesetzt und genauso auch, wenn die Adresse oder die Matrikelnummer bereits
     * existieren.
     *
     * @param studentDTO JSON-Daten für ein Student im Request-Body.
     * @param res Leeres Response-Objekt von Express.
     * @param req Request-Objekt von Express.
     * @returns Leeres Promise-Objekt.
     */
    @Post()
    // TODO: Security muss noch implementiert werden!
    //@RolesAllowed('admin', 'fachabteilung')
    @ApiOperation({ summary: 'Ein neues Student anlegen' })
    @ApiCreatedResponse({ description: 'Erfolgreich neu angelegt' })
    @ApiBadRequestResponse({ description: 'Fehlerhafte Studentdaten' })
    @ApiForbiddenResponse({ description: MSG_FORBIDDEN })
    async post(
        @Body() studentDTO: StudentDTO,
        @Req() req: Request,
        @Res() res: Response,
    ): Promise<Response> {
        this.#logger.debug('post: studentDTO=%o', studentDTO);

        const student = this.#studentDtoToStudent(studentDTO);
        const result = await this.#service.create(student);

        const location = `${getBaseUri(req)}/${result}`;
        this.#logger.debug('post: location=%s', location);
        return res.location(location).send();
    }

    /**
     * Ein vorhandener Student wird asynchron aktualisiert.
     *
     * Im Request-Objekt von Express muss die ID des zu aktualisierenden Studenten
     * als Pfad-Parameter enthalten sein. Außerdem muss im Rumpf der zu
     * aktualisierender Student als JSON-Datensatz enthalten sein. Damit die
     * Aktualisierung überhaupt durchgeführt werden kann, muss im Header
     * `If-Match` auf die korrekte Version für optimistische Synchronisation
     * gesetzt sein.
     *
     * Bei erfolgreicher Aktualisierung wird der Statuscode `204` (`No Content`)
     * gesetzt und im Header auch `ETag` mit der neuen Version mitgeliefert.
     *
     * Falls die Versionsnummer fehlt, wird der Statuscode `428` (`Precondition
     * required`) gesetzt; und falls sie nicht korrekt ist, der Statuscode `412`
     * (`Precondition failed`). Falls Constraints verletzt sind, wird der
     * Statuscode `400` (`Bad Request`) gesetzt und genauso auch, wenn die
     * Adresse oder die Matrikelnummer bereits existieren.
     *
     * @param studentDTO Studentendaten im Body des Request-Objekts.
     * @param id Pfad-Paramater für die ID.
     * @param version Versionsnummer aus dem Header _If-Match_.
     * @param res Leeres Response-Objekt von Express.
     * @returns Leeres Promise-Objekt.
     */
    // eslint-disable-next-line max-params
    @Put(':id')
    // TODO: Security muss noch implementiert werden!
    //@RolesAllowed('admin', 'fachabteilung')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({
        summary: 'Ein vorhandenes Student aktualisieren',
        tags: ['Aktualisieren'],
    })
    @ApiHeader({
        name: 'If-Match',
        description: 'Header für optimistische Synchronisation',
        required: false,
    })
    @ApiNoContentResponse({ description: 'Erfolgreich aktualisiert' })
    @ApiBadRequestResponse({ description: 'Fehlerhafte Studentdaten' })
    @ApiPreconditionFailedResponse({
        description: 'Falsche Version im Header "If-Match"',
    })
    @ApiResponse({
        status: HttpStatus.PRECONDITION_REQUIRED,
        description: 'Header "If-Match" fehlt',
    })
    @ApiForbiddenResponse({ description: MSG_FORBIDDEN })
    async put(
        @Body() studentDTO: StudentDtoOhneRef,
        @Param('id') id: number,
        @Headers('If-Match') version: string | undefined,
        @Res() res: Response,
    ): Promise<Response> {
        this.#logger.debug(
            'put: id=%s, studentDTO=%o, version=%s',
            id,
            studentDTO,
            version,
        );

        if (version === undefined) {
            const msg = 'Header "If-Match" fehlt';
            this.#logger.debug('put: msg=%s', msg);
            return res
                .status(HttpStatus.PRECONDITION_REQUIRED)
                .set('Content-Type', 'application/json')
                .send(msg);
        }

        const student = this.#studentDtoOhneRefToStudent(studentDTO);
        const neueVersion = await this.#service.update({
            id,
            student,
            version,
        });
        this.#logger.debug('put: version=%d', neueVersion);
        return res.header('ETag', `"${neueVersion}"`).send();
    }

    /**
     * Ein Student wird anhand seiner ID-gelöscht, die als Pfad-Parameter angegeben
     * ist. Der zurückgelieferte Statuscode ist `204` (`No Content`).
     *
     * @param id Pfad-Parameter für die ID.
     * @returns Leeres Promise-Objekt.
     */
    @Delete(':id')
    // TODO: Security muss noch implementiert werden!
    //@RolesAllowed('admin')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Student mit der ID löschen' })
    @ApiNoContentResponse({
        description: 'Der Student wurde gelöscht oder war nicht vorhanden',
    })
    @ApiForbiddenResponse({ description: MSG_FORBIDDEN })
    async delete(@Param('id') id: number) {
        this.#logger.debug('delete: id=%s', id);
        await this.#service.delete(id);
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
        const student = {
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

        // Rueckwaertsverweise
        student.adresse.student = student;
        student.faecher?.forEach((fach) => {
            fach.student = student;
        });
        return student;
    }

    #studentDtoOhneRefToStudent(studentDTO: StudentDtoOhneRef): Student {
        return {
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
            adresse: undefined,
            faecher: undefined,
            erzeugt: undefined,
            aktualisiert: undefined,
        };
    }
}
