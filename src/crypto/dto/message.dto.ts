import { IsString } from "class-validator";

export class MsgDTO {

    @IsString()
    readonly msg: string;
}