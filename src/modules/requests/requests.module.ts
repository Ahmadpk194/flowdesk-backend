import { Module } from '@nestjs/common';
import { RequestsController } from './requests.controller';
import { RequestsService } from './requests.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestEntity } from './entities/request.entity';
import { JwtModule } from '@nestjs/jwt';
import { UserEntity } from '../users/entities/user.entity';

@Module({
  imports:[TypeOrmModule.forFeature([RequestEntity, UserEntity]), JwtModule],
  controllers: [RequestsController],
  providers: [RequestsService]
})
export class RequestsModule {}
