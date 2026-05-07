import { Body, Controller, Delete, Get, NotFoundException, Param, ParseUUIDPipe, Patch, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from './enums/user-role';
import { apiResponse } from 'src/common/utils/api-response';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class UsersController {
    constructor(private userService: UsersService) { }

    // @UseGuards(JwtAuthGuard)
    @Get('/')
    async getUsers() {
        const users = await this.userService.findAll();
        return apiResponse('Users fetched Success', users)
    }

    @Get('/:id')
    async findOneById(@Param('id', ParseUUIDPipe) id: string) {
        const user = await this.userService.findById(id);
        return apiResponse('User Fetched Success', user)
    }

    @Patch(':id/role')
    async updateRole(@Body() body: UpdateUserRoleDto, @Param('id', ParseUUIDPipe) id: string) {
        await this.userService.updateUserRole(id, body.role)
        return apiResponse('Role Update success')
    }

    @Delete('/:id')
    async deleteUserById(@Param('id', ParseUUIDPipe) id: string) {
        const result = await this.userService.deleteUser(id)
        return apiResponse('User Deleted Successfully!', { id: result.deletedId })
    }
}
