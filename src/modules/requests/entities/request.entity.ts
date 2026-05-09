import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { RequestStatusEnum } from "../enums/req-status.enum";
import { UserEntity } from "src/modules/users/entities/user.entity";

@Entity('requests')
export class RequestEntity {
    @PrimaryGeneratedColumn('uuid')
    uuid!: string

    @Column({ type: 'text' })
    title!: string;

    @Column()
    description!: string;

    @Column({
        type: 'enum',
        enum: RequestStatusEnum,
        default: RequestStatusEnum.PENDING
    })
    status!: RequestStatusEnum

    @Column({ nullable: true })
    rejectionReason!: string

    @ManyToOne(() => UserEntity, user => user.createdRequests, {
        nullable: true,
        onDelete: 'SET NULL'
    })
    createdBy!: UserEntity

    @ManyToOne(() => UserEntity, user => user.reviewedRequests, {
        nullable: true,
        onDelete: 'SET NULL'
    })
    reviewedBy!: UserEntity


    @Column({ nullable: true })
    reviewedAt!: Date

    @CreateDateColumn()
    createdAt!: Date

    @UpdateDateColumn()
    updatedAt!: Date

}