import { IsString } from "class-validator";

export class SignObjectPacketDTO {

    readonly message: object;

    @IsString()
    readonly privateKey: string;
}