import { Entity, Column, BaseEntity, PrimaryColumn, BeforeUpdate } from "typeorm"

@Entity()
export class State extends BaseEntity {
    @PrimaryColumn()
    id!: string;

    @Column({ default: 0 })
    timer!: number

    @Column({ default: 0 })
    coins!: number

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    last_updated!: Date;

    @BeforeUpdate()
    updateLastUpdated() {
        this.last_updated = new Date();
    }
}

