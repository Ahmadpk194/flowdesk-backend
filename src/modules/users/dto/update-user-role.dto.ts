import { IsEnum } from "class-validator";
import { UserRole } from "../enums/user-role";

export class UpdateUserRoleDto{
    @IsEnum(UserRole)
    role!: UserRole
}