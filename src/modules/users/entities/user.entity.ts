import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { UserRole } from "../enums/user-role";

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
}