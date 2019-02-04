import { IsString, IsArray, IsInt, Min, Max, ValidateIf, IsNotEmpty, ArrayNotEmpty } from "class-validator";

//DTO (data transfer object) - обьекты таких классов определяют формат данных, передаваемых по сетям
//Можно было б использовать интерфейсы, но Nest их теряет при трансформации в валидаторах
export class NodeDto {

    @ValidateIf(o => 2 !== o.type)
    @IsString()
    @IsNotEmpty()
    readonly hash: string;

    @ValidateIf(o => o.type > 1)
    @IsString()
    @IsNotEmpty()
    readonly parentHash: string;

    @IsString()
    @IsNotEmpty()
    readonly authorPublicKey: string;

    @ValidateIf(o => 2 !== o.type)
    @IsString()
    @IsNotEmpty()
    readonly signature: string;

    @IsInt()
    @Min(1)
    @Max(5)
    readonly type: number;

    @ValidateIf(o => 1 === o.type)
    @IsString()
    @IsNotEmpty()
    readonly votingDescription: string;

    @ValidateIf(o => 1 === o.type)
    @IsInt()
    @Min(0)
    readonly startTime: number;

    @ValidateIf(o => 1 === o.type)
    @IsInt()
    @Min(0)
    readonly endTime: number;

    @ValidateIf(o => 1 === o.type)
    @IsArray()
    @ArrayNotEmpty()
    readonly candidates: string[];

    @ValidateIf(o => 1 === o.type)
    @IsArray()
    @ArrayNotEmpty()
    readonly admittedVoters: number[];
    
    @ValidateIf(o => 3 === o.type)
    @IsArray()
    @ArrayNotEmpty()
    readonly registeredVoters: number[];

    @ValidateIf(o => 1 === o.type)
    @IsString()
    @IsNotEmpty()
    readonly votingPublicKey: string;

    @ValidateIf(o => 2 === o.type)
    @IsString()
    @IsNotEmpty()
    readonly admittedUserPublicKey: string;

    @ValidateIf(o => 4 === o.type)
    @IsString()
    @IsNotEmpty()
    readonly selectedVariant: string;
}