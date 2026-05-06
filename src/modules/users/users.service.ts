import { Injectable, NotFoundException } from '@nestjs/common';
import { UserEntity } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from './enums/user-role';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(UserEntity) private userRepo: Repository<UserEntity>
    ) { }

    async findAll() {
        const users = await this.userRepo.find();
        return users;
    }

    async findById(id: string) {
        const user = await this.userRepo.findOne({ where: { id } })
        if (!user) {
            throw new NotFoundException('No User found!')
        }
        return user;
    }

    async updateUserRole(id: string, role: UserRole) {
        const result = await this.userRepo.update(id, { role });

        if (result.affected === 0) {
            throw new NotFoundException('No User found!');
        }
        return true;
    }

    async deleteUser(id: string) {
        const result = await this.userRepo.delete(id);

        if (result.affected === 0) {
            throw new NotFoundException('User not found!');
        }

        return {
            success: true,
            deletedId: id
        };
    }
}
