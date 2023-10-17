import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Student } from './student.entity.js';

@Entity()
export class Fach {
    @Column('int')
    @PrimaryGeneratedColumn()
    id: number | undefined;

    @Column('varchar', { unique: true, length: 32 })
    readonly name!: string;

    @Column('varchar', { length: 10 })
    readonly abkuerzung: string | undefined;

    @ManyToOne(() => Student, (student) => student.faecher)
    @JoinColumn({ name: 'student_id' })
    student: Student | undefined;

    public toString = (): string =>
        JSON.stringify({
            id: this.id,
            name: this.name,
            abkuerzung: this.abkuerzung,
        });
}
