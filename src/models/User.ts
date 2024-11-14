import { Entity, Column, OneToMany, BaseEntity, PrimaryColumn } from "typeorm"
import { Referral } from "./Referral"

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

    @Column({ default: false })
    is_premium!: boolean;

    @OneToMany(() => Referral, referral => referral.inviter)
    referrals!: Referral[]
}