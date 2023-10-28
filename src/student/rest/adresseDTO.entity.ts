/**
 * Das Modul besteht aus der Entity-Klasse.
 * @packageDocumentation
 */

import { Matches, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

const ORT_MAX_LENGTH = 40;
const PLZ_MAX_LENGTH = 40;
const LAND_MAX_LENGTH = 40;

/**
 * Entity-Klasse für Adresse ohne TypeORM.
 */

export class AdresseDTO {
    @Matches('^\\w.*')
    @MaxLength(ORT_MAX_LENGTH)
    @ApiProperty({ example: 'Der Ort', type: String })
    readonly ort!: string;

    @MaxLength(PLZ_MAX_LENGTH)
    @ApiProperty({ example: 'Die PLZ', type: String })
    readonly plz: string | undefined;

    @MaxLength(LAND_MAX_LENGTH)
    @ApiProperty({ example: 'Das Land', type: String })
    readonly land: string | undefined;
}
