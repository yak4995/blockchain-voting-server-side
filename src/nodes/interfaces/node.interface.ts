import { Document } from 'mongoose';

//А этот класс, в отличии от DTO, показывает интерфейс Node не во время передачи по сети, а внутри серверной части приложения
export interface Node extends Document {
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