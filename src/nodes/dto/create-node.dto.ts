//DTO (data transfer object) - обьекты таких классов определяют формат данных, передаваемых по сетям
//Можно было б использовать интерфейсы, но Nest их игнорит
export class NodeDto {
    readonly hash: string;
    readonly parent_hash: string;
    readonly author_public_key: string;
    readonly signature: string;
    readonly type: number;
    readonly voting_description: string;
    readonly start_time: number;
    readonly end_time: number;
    readonly voting_public_key: string;
    readonly admitted_user_public_key: string;
    readonly selected_variant: number;
}