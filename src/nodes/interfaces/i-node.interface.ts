import { NodeType } from '../enums/nodeType.enum';

export interface INode {
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
