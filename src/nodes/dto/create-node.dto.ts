import { IsString, IsNumber, IsDateString } from "class-validator";

//DTO (data transfer object) - обьекты таких классов определяют формат данных, передаваемых по сетям
//Можно было б использовать интерфейсы, но Nest их теряет при трансформации в валидаторах
export class NodeDto {

    @IsString()
    readonly hash: string;

    @IsString()
    readonly parent_hash: string;

    @IsString()
    readonly author_public_key: string;

    @IsString()
    readonly signature: string;

    @IsNumber()
    readonly type: number;

    @IsString()
    readonly voting_description: string;

    @IsDateString()
    readonly start_time: string;

    @IsDateString()
    readonly end_time: string;

    @IsString()
    readonly voting_public_key: string;

    @IsString()
    readonly admitted_user_public_key: string;

    @IsNumber()
    readonly selected_variant: number;
}