import { Entity, Column, OneToMany, BaseEntity, PrimaryColumn } from "typeorm"

@Entity()
export class User extends BaseEntity {
    @PrimaryColumn()
    id!: string;

    @Column()
    first_name!: string;

    @Column({ nullable: true })
    last_name!: string;

    @Column()
    username!: string;

    @Column({ nullable: true })
    language_code!: string;
}