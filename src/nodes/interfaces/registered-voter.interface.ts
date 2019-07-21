import { Document } from 'mongoose';
import { IRegisteredVoter } from './i-registered-voter.interface';

export interface RegisteredVoter extends IRegisteredVoter, Document {
  readonly hash: string;
  readonly registeredVoterId: number;
}
