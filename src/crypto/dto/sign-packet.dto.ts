import { IsString } from "class-validator";

export class SignPacketDTO {

    @IsString()
    readonly message: string;

    @IsString()
    readonly privateKey: string;
}