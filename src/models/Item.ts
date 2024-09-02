import { Entity, Column, BaseEntity, PrimaryGeneratedColumn, OneToMany } from "typeorm"
import { UserItem } from "./UserItem";

@Entity()
export class Item extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string

    @Column()
    type!: string

    @Column()
    image!: string

    @Column("float", { default: 0 })
    passive_bonus!: number

    @Column("float", { default: 0 })
    cost!: number

    @OneToMany(() => UserItem, userItem => userItem.item)
    userItems!: UserItem[]
}

