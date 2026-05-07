import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { UserRole } from "../enums/user-role";
import { RequestEntity } from "src/modules/requests/entities/request.entity";

@Entity('users')
export class UserEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: "varchar", length: 100 })
    name!: string;

    @Column({ type: 'varchar', unique: true })
    email!: string

    @Column({ type: 'text', select: false })
    password!: string

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.EMPLOYEE
    })
    role!: UserRole

    @Column({ type: 'boolean', default: true })
    is_active!: boolean

    @Column({ type: 'text', nullable: true, select: false })
    refreshTokenHash!: string | null;

    @CreateDateColumn({ type: 'timestamptz' })
    created_at!: Date

    @UpdateDateColumn({ type: 'timestamptz' })
    updated_at!: Date

    @OneToMany(() => RequestEntity, request => request.createdBy)
    createdRequests!: RequestEntity[]

    @OneToMany(() => RequestEntity, request => request.reviewedBy)
    reviewedRequests!: RequestEntity[]
}