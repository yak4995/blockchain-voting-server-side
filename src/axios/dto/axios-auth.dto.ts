import { IsString } from "class-validator";

export class AxiosAuthDTO {

    @IsString()
    readonly username: string;

    @IsString()
    readonly password: string;
}