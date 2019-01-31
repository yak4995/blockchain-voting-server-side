import { IsString, IsArray, IsInt, Min, Max, ValidateIf, IsNotEmpty, ArrayNotEmpty } from "class-validator";

//DTO (data transfer object) - обьекты таких классов определяют формат данных, передаваемых по сетям
//Можно было б использовать интерфейсы, но Nest их теряет при трансформации в валидаторах
export class NodeDto {

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

    @IsString()
    @IsNotEmpty()
    readonly signature: string;

    @IsInt()
    @Min(1)
    @Max(5)
    readonly type: number;

    @IsString()
    @ValidateIf(o => o.type == 1) //?
    @IsNotEmpty()
    readonly votingDescription: string;

    @IsInt()
    @Min(0)
    readonly startTime: number;

    @IsInt()
    @Min(0)
    readonly endTime: number;

    @ValidateIf(o => o.type == 1)
    @IsArray()
    @ArrayNotEmpty()
    readonly candidates: string[];

    @ValidateIf(o => o.type == 1)
    @IsArray()
    @ArrayNotEmpty()
    readonly admittedVoters: number[];
    
    
    @ValidateIf(o => o.type == 3)
    @IsArray()
    @ArrayNotEmpty()
    readonly registeredVoters: number[];

    @ValidateIf(o => o.type == 1)
    @IsString()
    @IsNotEmpty()
    readonly votingPublicKey: string;

    @ValidateIf(o => o.type == 2)
    @IsString()
    @IsNotEmpty()
    readonly admittedUserPublicKey: string;

    @ValidateIf(o => o.type == 4)
    @IsString()
    @IsNotEmpty()
    readonly selectedVariant: string;
}