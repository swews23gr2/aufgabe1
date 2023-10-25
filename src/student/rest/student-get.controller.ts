/**
 * Das Modul besteht aus der Controller-Klasse für Lesen an der REST-Schnittstelle.
 * @packageDocumentation
 */

// eslint-disable-next-line max-classes-per-file
import { type Abschluss, type Student } from '../entity/student.entity.js';
import { type Adresse } from '../entity/adresse.entity.js';
// eslint-disable-next-line sort-imports
import {
    ApiHeader,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiProperty,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import {
    StudentReadService,
    type Suchkriterien,
} from '../service/student-read.service.js';
// eslint-disable-next-line sort-imports
import {
    Controller,
    Get,
    Headers,
    HttpStatus,
    Param,
    Query,
    Req,
    Res,
    UseInterceptors,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ResponseTimeInterceptor } from '../../logger/response-time.interceptor.js';
import { getBaseUri } from './getBaseUri.js';
import { getLogger } from '../../logger/logger.js';
import { paths } from '../../config/paths.js';

/** href-Link für HATEOAS */
export interface Link {
    /** href-Link für HATEOAS-Links */
    readonly href: string;
}

/** Links für HATEOAS */
export interface Links {
    /** self-Link */
    readonly self: Link;
    /** Optionaler Linke für list */
    readonly list?: Link;
    /** Optionaler Linke für add */
    readonly add?: Link;
    /** Optionaler Linke für update */
    readonly update?: Link;
    /** Optionaler Linke für remove */
    readonly remove?: Link;
}

/** Typedefinition für ein Adresse-Objekt ohne Rückwärtsverweis zum Student */
export type AdresseModel = Omit<Adresse, 'student' | 'id'>;

/** Student-Objekt mit HATEOAS-Links */
export type StudentModel = Omit<
    Student,
    'faecher' | 'aktualisiert' | 'erzeugt' | 'id' | 'adresse' | 'version'
> & {
    adresse: AdresseModel;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    _links: Links;
};

/** Student-Objekte mit HATEOAS-Links in einem JSON-Array. */
export interface StudentenModel {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    _embedded: {
        studenten: StudentModel[];
    };
}

/**
 * Klasse für `StudentGetController`, um Queries in _OpenAPI_ bzw. Swagger zu
 * formulieren. `StudentController` hat dieselben Properties wie die Basisklasse
 * `Student` - allerdings mit dem Unterschied, dass diese Properties beim Ableiten
 * so überschrieben sind, dass sie auch nicht gesetzt bzw. undefined sein
 * dürfen, damit die Queries flexibel formuliert werden können. Deshalb ist auch
 * immer der zusätzliche Typ undefined erforderlich.
 * Außerdem muss noch `string` statt `Date` verwendet werden, weil es in OpenAPI
 * den Typ Date nicht gibt.
 */
export class StudentQuery implements Suchkriterien {
    @ApiProperty({ required: false })
    declare readonly vorname: string;

    @ApiProperty({ required: false })
    declare readonly nachname: string;

    @ApiProperty({ required: false })
    declare readonly geburtsdatum: Date;

    @ApiProperty({ required: false })
    declare readonly matrikel: number;

    @ApiProperty({ required: false })
    declare readonly email: string;

    @ApiProperty({ required: false })
    declare readonly studienfach: string;

    @ApiProperty({ required: false })
    declare readonly abschluss: Abschluss;

    @ApiProperty({ required: false })
    declare readonly homepage: string;

    @ApiProperty({ required: false })
    declare readonly adresse: string;
}

const APPLICATION_HAL_JSON = 'application/hal+json';

/**
 * Die Controller-Klasse für die Verwaltung von Studenten.
 */
@Controller(paths.rest)
// @UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(ResponseTimeInterceptor)
@ApiTags('Student REST-API')
// @ApiBearerAuth()
export class StudentGetController {
    readonly #service: StudentReadService;

    readonly #logger = getLogger(StudentGetController.name);

    constructor(service: StudentReadService) {
        this.#service = service;
    }

    /**
     * Ein Student wird asynchron anhand seiner ID als Pfadparameter gesucht.
     *
     * Falls es ein solcher Student gibt und `If-None-Match` im Request-Header
     * auf die aktuelle Version des Studenten gesetzt war, wird der Statuscode
     * `304` (`Not Modified`) zurückgeliefert. Falls `If-None-Match` nicht
     * gesetzt ist oder eine veraltete Version enthält, wird der gefundene
     * Student im Rumpf der Response als JSON-Datensatz mit Atom-Links für HATEOAS
     * und dem Statuscode `200` (`OK`) zurückgeliefert.
     *
     * Falls es keinen Studenten zur angegebenen ID gibt, wird der Statuscode `404`
     * (`Not Found`) zurückgeliefert.
     *
     * @param idStr Pfad-Parameter `id`
     * @param req Request-Objekt von Express mit Pfadparameter, Query-String,
     *            Request-Header und Request-Body.
     * @param version Versionsnummer im Request-Header bei `If-None-Match`
     * @param res Leeres Response-Objekt von Express.
     * @returns Leeres Promise-Objekt.
     */
    // eslint-disable-next-line max-params
    @Get(':id')
    @ApiOperation({ summary: 'Suche mit der Student-ID' })
    @ApiParam({
        name: 'id',
        description: 'Z.B. 1',
    })
    @ApiHeader({
        name: 'If-None-Match',
        description: 'Header für bedingte GET-Requests, z.B. "0"',
        required: false,
    })
    @ApiOkResponse({ description: 'Der Student wurde gefunden' })
    @ApiNotFoundResponse({ description: 'Kein Student zur ID gefunden' })
    @ApiResponse({
        status: HttpStatus.NOT_MODIFIED,
        description: 'Der Student wurde bereits heruntergeladen',
    })
    async getById(
        @Param('id') idStr: string,
        @Req() req: Request,
        @Headers('If-None-Match') version: string | undefined,
        @Res() res: Response,
    ): Promise<Response<StudentModel | undefined>> {
        this.#logger.debug('getById: idStr=%s, version=%s"', idStr, version);
        const id = Number(idStr);
        if (Number.isNaN(id)) {
            this.#logger.debug('getById: NaN');
            return res.sendStatus(HttpStatus.NOT_FOUND);
        }

        if (req.accepts([APPLICATION_HAL_JSON, 'json', 'html']) === false) {
            this.#logger.debug('getById: accepted=%o', req.accepted);
            return res.sendStatus(HttpStatus.NOT_ACCEPTABLE);
        }

        const student = await this.#service.findById({ id });
        if (this.#logger.isLevelEnabled('debug')) {
            this.#logger.debug('getById(): student=%s', student.toString());
            this.#logger.debug('getById(): adresse=%o', student.adresse);
        }

        // ETags
        const versionDb = student.version;
        if (version === `"${versionDb}"`) {
            this.#logger.debug('getById: NOT_MODIFIED');
            return res.sendStatus(HttpStatus.NOT_MODIFIED);
        }
        this.#logger.debug('getById: versionDb=%s', versionDb);
        res.header('ETag', `"${versionDb}"`);

        // HATEOAS mit Atom Links und HAL (= Hypertext Application Language)
        const studentModel = this.#toModel(student, req);
        this.#logger.debug('getById: studentModel=%o', studentModel);
        return res.contentType(APPLICATION_HAL_JSON).json(studentModel);
    }

    /**
     * Studenten werden mit Query-Parametern asynchron gesucht. Falls es mindestens
     * ein solcher Student gibt, wird der Statuscode `200` (`OK`) gesetzt. Im Rumpf
     * der Response ist das JSON-Array mit den gefundenen Studenten, die jeweils
     * um Atom-Links für HATEOAS ergänzt sind.
     *
     * Falls es keinen Studenten zu den Suchkriterien gibt, wird der Statuscode `404`
     * (`Not Found`) gesetzt.
     *
     * Falls es keine Query-Parameter gibt, werden alle Studenten ermittelt.
     *
     * @param query Query-Parameter von Express.
     * @param req Request-Objekt von Express.
     * @param res Leeres Response-Objekt von Express.
     * @returns Leeres Promise-Objekt.
     */
    @Get()
    @ApiOperation({ summary: 'Suche mit Suchkriterien' })
    @ApiOkResponse({ description: 'Eine evtl. leere Liste mit Studenten' })
    async get(
        @Query() query: StudentQuery,
        @Req() req: Request,
        @Res() res: Response,
    ): Promise<Response<StudentenModel | undefined>> {
        this.#logger.debug('get: query=%o', query);

        if (req.accepts([APPLICATION_HAL_JSON, 'json', 'html']) === false) {
            this.#logger.debug('get: accepted=%o', req.accepted);
            return res.sendStatus(HttpStatus.NOT_ACCEPTABLE);
        }

        const studenten = await this.#service.find(query);
        this.#logger.debug('get: %o', studenten);

        // HATEOAS: Atom Links je Student
        const studentenModel = studenten.map((student) =>
            this.#toModel(student, req, false),
        );
        this.#logger.debug('get: studentenModel=%o', studentenModel);

        const result: StudentenModel = {
            _embedded: { studenten: studentenModel },
        };
        return res.contentType(APPLICATION_HAL_JSON).json(result).send();
    }

    #toModel(student: Student, req: Request, all = true) {
        const baseUri = getBaseUri(req);
        this.#logger.debug('#toModel: baseUri=%s', baseUri);
        const { id } = student;
        const links = all
            ? {
                  self: { href: `${baseUri}/${id}` },
                  list: { href: `${baseUri}` },
                  add: { href: `${baseUri}` },
                  update: { href: `${baseUri}/${id}` },
                  remove: { href: `${baseUri}/${id}` },
              }
            : { self: { href: `${baseUri}/${id}` } };

        this.#logger.debug('#toModel: student=%o, links=%o', student, links);
        const adresseModel: AdresseModel = {
            ort: student.adresse?.ort ?? 'N/A', // eslint-disable-line unicorn/consistent-destructuring
            plz: student.adresse?.plz ?? 'N/A', // eslint-disable-line unicorn/consistent-destructuring
            land: student.adresse?.land ?? 'N/A', // eslint-disable-line unicorn/consistent-destructuring
        };
        /* eslint-disable unicorn/consistent-destructuring */
        const studentModel: StudentModel = {
            vorname: student.vorname,
            nachname: student.nachname,
            geburtsdatum: student.geburtsdatum,
            matrikel: student.matrikel,
            email: student.email,
            studienfach: student.studienfach,
            abschluss: student.abschluss,
            homepage: student.homepage,
            adresse: adresseModel,
            _links: links,
        };
        /* eslint-enable unicorn/consistent-destructuring */

        return studentModel;
    }
}
