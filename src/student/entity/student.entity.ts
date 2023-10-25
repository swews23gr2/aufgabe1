/**
 * Das Modul besteht aus der Entity-Klasse.
 * @packageDocumentation
 */
import { Adresse } from './adresse.entity.js';
import { ApiProperty } from '@nestjs/swagger';
import { Fach } from './fach.entity.js';
import { dbType } from '../../config/dbtype.js';
// eslint-disable-next-line sort-imports
import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    VersionColumn,
} from 'typeorm';

/**
 * Alias-Typ für gültige Strings beim Abschluss eines Studenten.
 */
export type Abschluss = 'BACHELOR' | 'MASTER';

/**
 * Entity-Klasse zu einer relationalen Tabelle
 */
@Entity()
export class Student {
    @Column('int')
    @PrimaryGeneratedColumn()
    id: number | undefined;

    @VersionColumn()
    readonly version: number | undefined;

    @Column('varchar')
    @ApiProperty({ type: String })
    readonly vorname!: string;

    @Column('varchar')
    @ApiProperty({ type: String })
    readonly nachname!: string;

    @Column('date')
    @ApiProperty({ example: '2021-01-31' })
    readonly geburtsdatum: Date | string | undefined;

    @Column('int')
    @ApiProperty({ example: 12_345, type: Number })
    readonly matrikel: number | undefined;

    @Column('varchar', { length: 40 })
    @ApiProperty({ example: 'test@acme.de/', type: String })
    readonly email: string | undefined;

    @Column('varchar')
    @ApiProperty({ example: 'WIIB', type: String })
    readonly studienfach!: string;

    @Column('varchar', { length: 12 })
    @ApiProperty({ example: 'BACHELOR', type: String })
    readonly abschluss: Abschluss | undefined;

    @Column('varchar', { length: 40 })
    @ApiProperty({ example: 'https://test.de/', type: String })
    readonly homepage: string | undefined;

    @OneToOne(() => Adresse, (adresse) => adresse.student, {
        cascade: ['insert', 'remove'],
    })
    readonly adresse: Adresse | undefined;

    @OneToMany(() => Fach, (fach) => fach.student, {
        cascade: ['insert', 'remove'],
    })
    readonly faecher: Fach[] | undefined;

    @CreateDateColumn({
        type: dbType === 'sqlite' ? 'datetime' : 'timestamp',
    })
    readonly erzeugt: Date | undefined;

    @UpdateDateColumn({
        type: dbType === 'sqlite' ? 'datetime' : 'timestamp',
    })
    readonly aktualisiert: Date | undefined;

    public toString = (): string =>
        JSON.stringify({
            id: this.id,
            version: this.version,
            vorname: this.vorname,
            nachname: this.nachname,
            geburtsdatum: this.geburtsdatum,
            matrikel: this.matrikel,
            email: this.email,
            studienfach: this.studienfach,
            abschluss: this.abschluss,
            homepage: this.homepage,
            adresse: this.adresse,
            faecher: this.faecher,
        });
}
