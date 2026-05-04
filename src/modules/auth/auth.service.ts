import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt'
import { UserRole } from '../users/enums/user-role';
import { RegisterRespDto } from './dto/regiseter-response.dto';
import { LoginUserDto } from './dto/loginUser.dto';
import { JwtService } from '@nestjs/jwt';
import { LoginResponseDto } from './dto/login-response.dto';
import { apiResponse } from 'src/common/utils/api-response';
import { Response } from 'express';

@Injectable()
export class AuthService {
    constructor(@InjectRepository(UserEntity)
    private userRepo: Repository<UserEntity>,
        private jwtService: JwtService
    ) { }

    async register(dto: RegisterDto): Promise<RegisterRespDto> {
        const { name, email, password } = dto;

        // check existing
        const existing = await this.userRepo.findOne({ where: { email } });
        if (existing) {
            throw new BadRequestException('Email already exists')
        }

        // hashpass
        const hashedPass = await bcrypt.hash(password, 10);

        // create user
        const user = this.userRepo.create({
            name,
            email,
            password: hashedPass,
            role: UserRole.EMPLOYEE
        })

        // save user
        const savedUser = await this.userRepo.save(user)

        // return safe resonse
        return {
            id: savedUser.id,
            name: savedUser.name,
            email: savedUser.email,
            role: savedUser.role,
            isActive: savedUser.is_active,
            createdAt: savedUser.created_at,
            updatedAt: savedUser.updated_at
        } as RegisterRespDto;
    }

    async login(dto: LoginUserDto, res: Response): Promise<LoginResponseDto> {
        const { email, password } = dto;

        // check user exists
        const user = await this.userRepo.findOne({
            where: { email },
            select: ['id', 'name', 'email', 'password', 'role'],
        });

        if (!user) {
            throw new UnauthorizedException('User not found!')
        }

        // match password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials!')
        }

        // create access & refresh tokens
        const accessToken = this.jwtService.sign({
            sub: user.id,
            email: user.email,
            role: user.role
        }, {
            secret: process.env.JWT_ACCESS_SECRET,
            expiresIn: '15m'
        })

        const refreshToken = this.jwtService.sign({
            sub: user.id
        }, {
            secret: process.env.JWT_REFRESH_SECRET,
            expiresIn: '7d'
        })

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: false, // true in production (HTTPS)
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        // hash refresh token
        const refreshTokenHash = await bcrypt.hash(refreshToken, 10)

        // save refresh token in db
        await this.userRepo.update(user.id, {
            refreshTokenHash
        })

        // send response to user
        return apiResponse('Login success!', {
            accessToken, refreshToken, user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        })
    }

    async profile(user: any) {
        const { id, email, role } = user;

        const loggedInUser = await this.userRepo.findOne({ where: { id, email } });
        if (!loggedInUser) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        return loggedInUser;
    }

    async refresh(refreshToken: string) {
        if (!refreshToken) {
            throw new UnauthorizedException('No token provided!')
        }

        try {
            const payload = await this.jwtService.verify(refreshToken, {
                secret: process.env.JWT_REFRESH_SECRET
            })
            const { sub: id } = payload;

            // find user in db
            const user = await this.userRepo.findOne({
                where: { id },
                select: ['id', 'email', 'role', 'refreshTokenHash', 'name', 'is_active', 'password']
            });

            if (!user || !user.is_active) {
                throw new NotFoundException('User not found in db or not active')
            }

            if (!user.refreshTokenHash) {
                throw new UnauthorizedException('No active session');
            }

            // conpare ref token with hashed token in db
            const isMatch = await bcrypt.compare(refreshToken, user.refreshTokenHash)
            if (!isMatch) {
                throw new BadRequestException('Token invalid!')
            }

            const newAccessToken = this.jwtService.sign({
                sub: user.id, email: user.email, role: user.role
            }, {
                secret: process.env.JWT_ACCESS_SECRET,
                expiresIn: '15m'
            })

            const newRefreshToken = this.jwtService.sign({ sub: user.id }, {
                secret: process.env.JWT_REFRESH_SECRET,
                expiresIn: '7d'
            })

            const refreshTokenHash = await bcrypt.hash(newRefreshToken, 10)
            await this.userRepo.update(id, { refreshTokenHash })

            return { accessToken: newAccessToken, refreshToken: newRefreshToken };

        } catch (error) {
            throw new UnauthorizedException('Invalid or expired token!')
        }

    }

    async logout(refreshToken: string) {
        if (!refreshToken) {
            return {
                success: true,
                message: 'Already logged out',
            };
        }

        try {
            const payload = this.jwtService.verify(refreshToken, {
                secret: process.env.JWT_REFRESH_SECRET,
            });

            const userId = payload.sub;

            await this.userRepo.update(userId, {
                refreshTokenHash: null,
            });
        } catch {
            // ignore invalid token, still logout
        }

        return {
            success: true,
            message: 'Logged out successfully!',
        };
    }
}
