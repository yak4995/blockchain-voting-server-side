import { IsString, IsNumber, IsArray } from "class-validator";

//DTO (data transfer object) - обьекты таких классов определяют формат данных, передаваемых по сетям
//Можно было б использовать интерфейсы, но Nest их теряет при трансформации в валидаторах
export class NodeDto {

    @IsString()
    readonly hash: string;

    @IsString()
    readonly parentHash: string;

    @IsString()
    readonly authorPublicKey: string;

    @IsString()
    readonly signature: string;

    @IsNumber()
    readonly type: number;

    @IsString()
    readonly votingDescription: string;

    @IsNumber()
    readonly startTime: number;

    @IsNumber()
    readonly endTime: number;

    @IsArray()
    readonly candidates: string[];

    @IsArray()
    readonly admittedVoters: number[];
    
    @IsArray()
    readonly registeredVoters: number[];

    @IsString()
    readonly votingPublicKey: string;

    @IsString()
    readonly admittedUserPublicKey: string;

    @IsString()
    readonly selectedVariant: string;
}