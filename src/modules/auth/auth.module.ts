import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../users/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), JwtModule.register({
    secret: process.env.JWT_ACCESS_SECRET,
    signOptions: {expiresIn: '15m'}
  })],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule {}
