import { Entity, Column, BaseEntity, PrimaryGeneratedColumn } from "typeorm"

@Entity()
export class ConfigRow extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ nullable: true })
    bonus_code!: string

    @Column({ default: 5000 })
    league_goal!: number;
}

