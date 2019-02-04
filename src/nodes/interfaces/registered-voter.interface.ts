import { Document } from 'mongoose';

export interface RegisteredVoter extends Document {
  readonly hash: string;
  readonly registeredVoterId: number;
}