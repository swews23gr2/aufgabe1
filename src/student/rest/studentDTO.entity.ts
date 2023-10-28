/**
 * Das Modul besteht aus der Entity-Klasse.
 * @packageDocumentation
 */

// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable max-classes-per-file */
import { type Abschluss } from '../entity/student.entity.js';
import { AdresseDTO } from './adresseDTO.entity.js';
// eslint-disable-next-line sort-imports
import {
    ArrayUnique,
    IsArray,
    IsEmail,
    IsISO8601,
    IsOptional,
    IsString,
    IsUrl,
    Matches,
    MaxLength,
    ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { FachDTO } from './fachDTO.entity.js';
import { Type } from 'class-transformer';

export const MAX_RATING = 5;
const MAX_LENGTH_OF_URL = 40;

/**
 * Entity-Klasse für Studenten ohne TypeORM und ohne Referenzen.
 */

export class StudentDtoOhneRef {
    @IsString()
    @ApiProperty({ example: 'John', type: String })
    readonly vorname!: string;

    @IsString()
    @ApiProperty({ example: 'Doe', type: Number })
    readonly nachname!: string;

    @Matches(/^BACHELOR$|^MASTER$/u)
    @ApiProperty({ example: 'BACHELOR', type: String })
    readonly abschluss: Abschluss | undefined;

    @IsISO8601({ strict: true })
    @ApiProperty({ example: '2021-01-31' })
    readonly geburstdatum: Date | string | undefined;

    @IsOptional()
    @ApiProperty({ example: 12_345, type: Number })
    readonly matrikel: number | undefined;

    @IsEmail()
    @ApiProperty({ example: 'test@acme.de/', type: String })
    readonly email: string | undefined;

    @IsString()
    @ApiProperty({ example: 'WIIB', type: String })
    readonly studienfach!: string;

    @IsUrl()
    @IsOptional()
    @MaxLength(MAX_LENGTH_OF_URL)
    @ApiProperty({ example: 'https://test.de/', type: String })
    readonly homepage: string | undefined;
}

/**
 * Entity-Klasse für Studenten ohne TypeORM.
 */

export class StudentDTO extends StudentDtoOhneRef {
    @ValidateNested()
    @Type(() => AdresseDTO)
    @ApiProperty({ type: AdresseDTO })
    readonly adresse!: AdresseDTO;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @ArrayUnique()
    @Type(() => FachDTO)
    @ApiProperty({ type: [FachDTO] })
    readonly faecher: FachDTO[] | undefined;
}
