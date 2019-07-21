import { Document } from 'mongoose';
import { INode } from './i-node.interface';
import { NodeType } from '../enums/nodeType.enum';

// А этот класс, в отличии от DTO, показывает интерфейс Node не во время передачи по сети, а внутри серверной части приложения
export interface Node extends Document, INode {
  hash: string;
  readonly parentHash: string;
  readonly authorPublicKey: string;
  signature: string;
  readonly type: NodeType;
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
