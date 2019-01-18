import { IsNumber, IsString } from 'class-validator';

export class JwtTokenDTO {

    @IsNumber()
    readonly expiresIn: number;

    @IsString()
    readonly accessToken: string;
}