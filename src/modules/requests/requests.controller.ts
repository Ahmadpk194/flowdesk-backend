import { Body, Controller, Post, Get, Req, UseGuards, Param, ParseIntPipe, Patch, ParseUUIDPipe, NotFoundException, Query } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { RequestsService } from './requests.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from '../users/enums/user-role';
import { CreateRequestDto } from './dto/create-request.dto';
import { apiResponse } from 'src/common/utils/api-response';
import { User } from 'src/common/decorators/user.decorator';
import { RejectRequestDto } from './dto/reject-request.dto';
import { RequestQueryDto } from './dto/request-query.dto';

@Controller('requests')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)

export class RequestsController {
    constructor(private readonly reqService: RequestsService) { }

    @Roles(UserRole.EMPLOYEE)
    @Post('/')
    async createRequest(@Body() body: CreateRequestDto, @Req() req: any) {
        const savedReq = await this.reqService.create(body, req.user.sub);
        return apiResponse('Request Created Successfully!', savedReq)
    }

    @Roles(UserRole.EMPLOYEE)
    @Get('/my')
    async getMyRequests(@User() user: any) {
        const requests = await this.reqService.userRequests(user)
        return apiResponse('Requests fetched successfully', requests);
    }

    @Roles(UserRole.EMPLOYEE)
    @Patch(':id/cancel')
    async cancelRequest(@Param('id', ParseUUIDPipe) id: string, @User() user: any) {
        const cancelled = await this.reqService.cancel(id, user.sub)
        return apiResponse('Request cancelled', cancelled)
    }

    @Roles(UserRole.MANAGER)
    @Patch(':id/approve')
    async approveRequest(@Param('id', ParseUUIDPipe) id: string, @User() user: any) {
        const approve = await this.reqService.approve(id, user)
        return apiResponse('Request Approved', approve)
    }

    @Roles(UserRole.MANAGER)
    @Patch(':id/reject')
    async rejectRequest(@Body() body: RejectRequestDto,@Param('id', ParseUUIDPipe) id: string, @User() user: any) {
        const approve = await this.reqService.reject(body, id, user)
        return apiResponse('Request rejected', approve)
    }

    @Roles(UserRole.MANAGER)
    @Get('/')
    async getRequests(@Query() dto: RequestQueryDto){
        const data = await this.reqService.findRequests(dto);
        return apiResponse('Pending requests fetched Success!', data)
    }

    @Roles(UserRole.EMPLOYEE, UserRole.MANAGER)
    @Get(':id')
    async getSingleReqById(@Param('id', ParseUUIDPipe) id: string){
        const data = await this.reqService.findById(id);
        return apiResponse('Request fetched Success!', data)
    }
}
