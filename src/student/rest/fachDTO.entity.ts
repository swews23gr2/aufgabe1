/**
 * Das Modul besteht aus der Entity-Klasse.
 * @packageDocumentation
 */

import { ApiProperty } from '@nestjs/swagger';
import { MaxLength } from 'class-validator';

const MAX_NAME_LENGTH = 32;
const MAX_ABKUERZUNG_LENGTH = 32;

/**
 * Entity-Klasse für Fach ohne TypeORM.
 */
export class FachDTO {
    @MaxLength(MAX_NAME_LENGTH)
    @ApiProperty({ example: 'Der Name', type: String })
    readonly name!: string;

    @MaxLength(MAX_ABKUERZUNG_LENGTH)
    @ApiProperty({ example: 'SWE - Softwareengineering', type: String })
    readonly abkuerzung!: string;
}
