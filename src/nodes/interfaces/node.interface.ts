import { Document } from 'mongoose';

// А этот класс, в отличии от DTO, показывает интерфейс Node не во время передачи по сети, а внутри серверной части приложения
export interface Node extends Document {
  readonly hash: string;
  readonly parentHash: string;
  readonly authorPublicKey: string;
  readonly signature: string;
  readonly type: number;
  readonly votingDescription: string;
  readonly startTime: number;
  readonly endTime: number;
  readonly candidates: string[];
  readonly admittedVoters: number[];
  readonly registeredVoters: number[];
  readonly votingPublicKey: string;
  readonly admittedUserPublicKey: string;
  readonly selectedVariant: string;
}
