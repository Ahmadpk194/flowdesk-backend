import { IsEnum, IsOptional } from 'class-validator';
import { RequestStatusEnum } from '../enums/req-status.enum';

export class RequestQueryDto {
  @IsOptional()
  @IsEnum(RequestStatusEnum)
  status?: RequestStatusEnum;
}