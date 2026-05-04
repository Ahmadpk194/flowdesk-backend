import { Body, Controller, Delete, Get, HttpCode, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginUserDto } from './dto/loginUser.dto';
import type { Request, Response } from 'express';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { User } from 'src/common/decorators/user.decorator';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
    ) { }

    @Post('/register')
    registerUser(@Body() registerData: RegisterDto) {
        return this.authService.register(registerData)
    }

    @Post('/login')
    @HttpCode(200)
    loginUser(@Body() loginUser: LoginUserDto, @Res({ passthrough: true }) res: Response) {
        return this.authService.login(loginUser, res)
    }

    @UseGuards(JwtAuthGuard)
    @Get('/profile')
    getLoginUserProfile(@User() user: any) {
        return this.authService.profile(user)
    }

    @Post('/refresh')
    @HttpCode(200)
    async refreshToken(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const oldRefreshToken = req.cookies.refreshToken;
        const { accessToken, refreshToken } = await this.authService.refresh(oldRefreshToken)

        // set refresh token in cookies
        res.cookie('refreshToken', refreshToken, {
            secure: false,
            httpOnly: true,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })
        return {
            status: true,
            message: 'Refresh Token success!',
            data: { accessToken, refreshToken }
        }
    }

    @Post('/logout')
    @HttpCode(200)
    async logoutUser(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const refreshToken = req.cookies.refreshToken;
        res.clearCookie('refreshToken');
        return await this.authService.logout(refreshToken)
    }

}
