import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('users')
export class User {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({type: 'text'})
    email: string;

    @Column({type: 'text', unique: true})
    password: string;

    @Column({type: 'text'})
    fullName: string;

    @Column({type: 'text'})
    isActive: boolean;

    @Column({type: 'text'})
    roles: string[]

}
