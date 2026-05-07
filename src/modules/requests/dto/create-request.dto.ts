import { IsNotEmpty, IsString } from "class-validator";

export class CreateRequestDto{
    @IsString()
    @IsNotEmpty()
    title!: string

    @IsString()
    description!: string

}