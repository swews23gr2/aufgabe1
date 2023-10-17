import {
    Column,
    Entity,
    JoinColumn,
    OneToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Student } from './student.entity.js';

@Entity()
export class Adresse {
    @Column('int')
    @PrimaryGeneratedColumn()
    id: number | undefined;

    @Column('varchar')
    readonly ort!: string;

    @Column('varchar')
    readonly plz: string | undefined;

    @Column('varchar')
    readonly land: string | undefined;

    @OneToOne(() => Student, (student) => student.adresse)
    @JoinColumn({ name: 'student_id' })
    student: Student | undefined;

    public toString = (): string =>
        JSON.stringify({
            id: this.id,
            ort: this.ort,
            plz: this.plz,
            land: this.land,
        });
}
