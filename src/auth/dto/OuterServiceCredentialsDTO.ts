import { IsString } from 'class-validator';

export class OuterServiceCredentialsDTO {

    @IsString()
    readonly name: string;

    @IsString()
    readonly key: string;
}