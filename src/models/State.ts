import { Entity, Column, BaseEntity, PrimaryColumn, BeforeUpdate } from "typeorm"

@Entity()
export class State extends BaseEntity {
    @PrimaryColumn()
    id!: string;

    @Column({ default: 0 })
    timer!: number

    @Column({ default: 0 })
    coins!: number

    @Column({ default: 0 })
    all_coins!: number

    @Column({ default: -1 })
    shkiper_counter!: number

    @Column({ default: -1 })
    days_counter!: number

    @Column({ default: 0 })
    days_claimed!: number

    @Column({ default: 0 })
    previous_day!: number

    @Column({ default: 0 })
    referrals_claimed!: number

    @Column({ default: 0 })
    shkiper_timer!: number

    @Column({ type: 'text', default: '' })
    used_codes!: string; // Stores used codes in a comma-separated list

    @Column({ default: 0 })
    league_claimed!: number

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    last_updated!: Date;

    @Column({ nullable: true, type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    code_error!: Date;

    @BeforeUpdate()
    updateLastUpdated() {
        this.last_updated = new Date();
    }
}

