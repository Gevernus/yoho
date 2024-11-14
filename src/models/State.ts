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

    @Column({ default: 0 })
    shkiper_timer!: number

    @Column({ default: 'BRONZE' })
    league!: string

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    last_updated!: Date;

    @BeforeUpdate()
    updateLastUpdated() {
        this.last_updated = new Date();
    }
}

