/**
 * Das Modul besteht aus der Klasse {@linkcode StudentWriteService} für die
 * Schreiboperationen im Anwendungskern.
 * @packageDocumentation
 */
import { Adresse } from '../entity/adresse.entity.js';
// eslint-disable-next-line sort-imports
import { type DeleteResult, Repository } from 'typeorm';
import {
    EmailExistsException,
    MatrikelExistsException,
    VersionInvalidException,
    VersionOutdatedException,
} from './exceptions.js';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Fach } from '../entity/fach.entity.js';
import { Student } from '../entity/student.entity.js';
import { StudentReadService } from './student-read.service.js';
// eslint-disable-next-line sort-imports
import { InjectRepository } from '@nestjs/typeorm';
import { MailService } from '../../mail/mail.service.js';
import RE2 from 're2';
import { getLogger } from '../../logger/logger.js';

/** Typdefinitionen zum Aktualisieren eines Studenten mit `update`. */
export interface UpdateParams {
    /** ID des zu aktualisierenden Studenten. */
    readonly id: number | undefined;
    /** Student-Objekt mit den aktualisierten Werten. */
    readonly student: Student;
    /** Versionsnummer für die aktualisierenden Werte. */
    readonly version: string;
}

/**
 * Die Klasse `StudentWriteService` implementiert den Anwendungskern für das
 * Schreiben von Studenten und greift mit _TypeORM_ auf die DB zu.
 */
@Injectable()
export class StudentWriteService {
    private static readonly VERSION_PATTERN = new RE2('^"\\d*"');

    readonly #repo: Repository<Student>;

    readonly #readService: StudentReadService;

    readonly #mailService: MailService;

    readonly #logger = getLogger(StudentWriteService.name);

    constructor(
        @InjectRepository(Student) repo: Repository<Student>,
        readService: StudentReadService,
        mailService: MailService,
    ) {
        this.#repo = repo;
        this.#readService = readService;
        this.#mailService = mailService;
    }

    /**
     * Ein neuer Student soll angelegt werden.
     * @param student Der neu anzulegende Student
     * @returns Die ID des neu angelegten Studenten
     * @throws MatrikelExists falls die Matrikelnummer bereits existiert
     */
    async create(student: Student): Promise<number> {
        this.#logger.debug('create: student=%o', student);
        await this.#validateCreate(student);
        await this.#validateEmail(student);

        const studentDb = await this.#repo.save(student);
        this.#logger.debug('create: studentDb=%o', studentDb);

        await this.#sendmail(studentDb);

        return studentDb.id!;
    }

    /**
     * Ein vorhandener Student soll aktualisiert werden.
     * @param student Der zu aktualisierende Student
     * @param id ID des zu aktualisierenden Studenten
     * @param version Die Versionsnummer für optimistische Synchronisation
     * @returns Die neue Versionsnummer gemäß optimistischer Synchronisation
     * @throws VersionInvalidException falls die Versionsnummer ungültig ist
     * @throws VersionOutdatedException falls die Versionsnummer veraltet ist
     */
    async update({ id, student, version }: UpdateParams): Promise<number> {
        this.#logger.debug(
            'update: id=%d, student=%o, version=%s',
            id,
            student,
            version,
        );
        if (id === undefined) {
            this.#logger.debug('update: Keine gueltige ID');
            throw new NotFoundException(
                `Es gibt keinen Studenten mit der ID ${id}.`,
            );
        }

        const validateResult = await this.#validateUpdate(student, id, version);
        this.#logger.debug('update: validateResult=%o', validateResult);
        if (!(validateResult instanceof Student)) {
            return validateResult;
        }

        const studentNeu = validateResult;
        const merged = this.#repo.merge(studentNeu, student);
        this.#logger.debug('update: merged=%o', merged);
        const updated = await this.#repo.save(merged); // implizite Transaktion
        this.#logger.debug('update: updated=%o', updated);

        return updated.version!;
    }

    /**
     * Ein Student wird asynchron anhand seiner ID gelöscht.
     *
     * @param id ID des zu löschenden Studenten
     * @returns true, falls der Student vorhanden war und gelöscht wurde. Sonst false.
     */
    async delete(id: number) {
        this.#logger.debug('delete: id=%d', id);
        const student = await this.#readService.findById({
            id,
            mitFaechern: true,
        });

        let deleteResult: DeleteResult | undefined;
        await this.#repo.manager.transaction(async (transactionalMgr) => {
            const adresseId = student.adresse?.id;
            if (adresseId !== undefined) {
                await transactionalMgr.delete(Adresse, adresseId);
            }
            const faecher = student.faecher ?? [];
            for (const fach of faecher) {
                await transactionalMgr.delete(Fach, fach.id);
            }

            deleteResult = await transactionalMgr.delete(Student, id);
            this.#logger.debug('delete: deleteResult=%o', deleteResult);
        });

        return (
            deleteResult?.affected !== undefined &&
            deleteResult.affected !== null &&
            deleteResult.affected > 0
        );
    }

    async #validateCreate(student: Student): Promise<void> {
        this.#logger.debug('#validateCreate: student=%o', student);

        const { matrikel } = student;
        try {
            await this.#readService.find({ matrikel: matrikel! });
        } catch (err) {
            if (err instanceof NotFoundException) {
                return;
            }
        }
        throw new MatrikelExistsException(matrikel!);
    }

    async #validateEmail(student: Student): Promise<void> {
        this.#logger.debug('#validateCreate: student=%o', student);

        const { email } = student;
        try {
            await this.#readService.find({ email: email! });
        } catch (err) {
            if (err instanceof NotFoundException) {
                return;
            }
        }
        throw new EmailExistsException(email!);
    }

    async #sendmail(student: Student) {
        const subject = `Neuer Student ${student.id}`;
        const email = student.email ?? 'N/A';
        const body = `Der Student mit der E-Mail-Adresse <strong>${email}</strong> ist angelegt worden.`;
        await this.#mailService.sendmail({ subject, body });
    }

    async #validateUpdate(
        student: Student,
        id: number,
        versionStr: string,
    ): Promise<Student> {
        const version = this.#validateVersion(versionStr);
        this.#logger.debug(
            '#validateUpdate: student=%o, version=%s',
            student,
            version,
        );

        const resultFindById = await this.#findByIdAndCheckVersion(id, version);
        this.#logger.debug('#validateUpdate: %o', resultFindById);
        return resultFindById;
    }

    #validateVersion(version: string | undefined): number {
        this.#logger.debug('#validateVersion: version=%s', version);
        if (
            version === undefined ||
            !StudentWriteService.VERSION_PATTERN.test(version)
        ) {
            throw new VersionInvalidException(version);
        }

        return Number.parseInt(version.slice(1, -1), 10);
    }

    async #findByIdAndCheckVersion(
        id: number,
        version: number,
    ): Promise<Student> {
        const studentDb = await this.#readService.findById({ id });

        // nullish coalescing
        const versionDb = studentDb.version!;
        if (version < versionDb) {
            this.#logger.debug(
                '#checkIdAndVersion: VersionOutdated=%d',
                version,
            );
            throw new VersionOutdatedException(version);
        }

        return studentDb;
    }
}
