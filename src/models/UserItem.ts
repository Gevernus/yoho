import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne, JoinColumn } from "typeorm"
import { Item } from "./Item"

@Entity()
export class UserItem extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    user_id!: string

    @Column()
    item_id!: number

    @Column()
    level!: number

    @ManyToOne(() => Item, item => item.id)
    @JoinColumn({ name: "item_id" })
    item!: Item
}