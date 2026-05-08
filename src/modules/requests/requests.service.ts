import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RequestEntity } from './entities/request.entity';
import { Repository } from 'typeorm';
import { CreateRequestDto } from './dto/create-request.dto';
import { RequestStatusEnum } from './enums/req-status.enum';
import { UserEntity } from '../users/entities/user.entity';
import { RejectRequestDto } from './dto/reject-request.dto';
import { JwtPayload } from 'src/common/interfaces/jwt-payload.interface';
import { RequestQueryDto } from './dto/request-query.dto';
import { UserRole } from '../users/enums/user-role';

@Injectable()
export class RequestsService {
    constructor(
        @InjectRepository(RequestEntity)
        private readonly reqRepo: Repository<RequestEntity>,

        @InjectRepository(UserEntity)
        private readonly userRepo: Repository<UserEntity>
    ) { }

    async create(body: CreateRequestDto, userId: string) {
        const createReq = this.reqRepo.create({
            ...body,
            status: RequestStatusEnum.PENDING,
            createdBy: { id: userId } as UserEntity
        })
        const saved = await this.reqRepo.save(createReq)

        return saved;
    }

    async userRequests(user: any) {
        const requests = await this.reqRepo.find({
            where: {
                createdBy: {
                    id: user.sub
                }
            }
        });

        return requests;
    }

    async cancel(id: string, userId) {
        const req = await this.reqRepo.findOne({
            where: { uuid: id },
            relations: ['createdBy']
        });

        if (!req) {
            throw new NotFoundException('Request not found!')
        }

        if (req?.createdBy.id !== userId) {
            throw new ForbiddenException('You can only cancel your own requests.')
        }

        if (req.status !== RequestStatusEnum.PENDING) {
            throw new BadRequestException('Only pending request can be cancelled.')
        }

        req.status = RequestStatusEnum.CANCELLED

        return await this.reqRepo.save(req)
    }

    async approve(id, user) {
        const request = await this.reqRepo.findOne({
            where: { uuid: id },
        });

        if (!request) throw new NotFoundException('Request not found!')

        if (request.status !== RequestStatusEnum.PENDING) {
            throw new BadRequestException('Only pending requests can be approved!')
        }

        const manager = await this.userRepo.findOneBy({ id: user.sub });
        if (!manager) {
            throw new NotFoundException('Manager not found!')
        }

        request.status = RequestStatusEnum.APPROVED;
        request.reviewedBy = manager;
        request.reviewedAt = new Date();

        return await this.reqRepo.save(request)
    }

    async reject(body: RejectRequestDto, id: string, user: JwtPayload) {
        const request = await this.reqRepo.findOne({
            where: { uuid: id },
        });

        if (!request) throw new NotFoundException('Request not found!')

        if (request.status !== RequestStatusEnum.PENDING) {
            throw new BadRequestException('Only pending requests can be approved!')
        }

        const manager = await this.userRepo.findOneBy({ id: user.sub });
        if (!manager) {
            throw new NotFoundException('Manager not found!')
        }

        request.status = RequestStatusEnum.REJECTED;
        request.reviewedBy = manager;
        request.reviewedAt = new Date();
        request.rejectionResason = body.rejectionResason;

        return this.reqRepo.save(request);
    }

    async findRequests(query: RequestQueryDto) {
        const { status } = query;

        const requests = await this.reqRepo.find({
            where: status ? { status } : {},
            relations: ['createdBy', 'reviewedBy'],
            order: { createdAt: 'DESC' },
        });

        return requests;
    }

    async findById(id: string) {
        const request = await this.reqRepo.findOne({
            where: {
                uuid: id,
            },
            relations: ['createdBy', 'reviewedBy']
        })

        if (!request) {
            throw new NotFoundException('Request not found!');
        }

        return request;
    }

    async deleteRequest(id: string, user: JwtPayload) {
        const request = await this.reqRepo.findOne({
            where: { uuid: id },
            relations: ['createdBy'],
        });

        if (!request) {
            throw new NotFoundException('Request not found!');
        }

        const isAdmin = user.role === UserRole.ADMIN;
        const isOwner = request.createdBy.id === user.sub;

        // Employee can only delete own request, admin can delete any
        if (!isAdmin && !isOwner) {
            throw new ForbiddenException('You are not allowed to delete this request.');
        }

        return await this.reqRepo.remove(request);
    }
}
