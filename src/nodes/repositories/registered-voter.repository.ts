import BaseRepository, { Criteria } from '../../common/base.repository';
import { RegisteredVoter } from '../interfaces/registered-voter.interface';
import { Model } from 'mongoose';
import { Inject, Injectable } from '@nestjs/common';
import { IRegisteredVoter } from 'nodes/interfaces/i-registered-voter.interface';

@Injectable()
export default class RegisteredVoterRepository extends BaseRepository<IRegisteredVoter> {
    constructor(@Inject('RegisteredVoterModelToken') private readonly model: Model<RegisteredVoter>) {
        super();
    }

    create(votingHash: string, voterId: number): Promise<RegisteredVoter> {
        return new this.model({ hash: votingHash, registeredVoterId: voterId }).save();
    }

    findAll(): Promise<RegisteredVoter[]> {
        return this.model.find().exec();
    }

    findById(id: number): Promise<RegisteredVoter> {
        return this.model.findById(id).exec();
    }

    findOneByAndCriteria(searchCriteria: Criteria<RegisteredVoter>): Promise<RegisteredVoter> {
        return this.model.findOne(searchCriteria).exec();
    }

    findByAndCriteria(searchCriteria: Criteria<RegisteredVoter>): Promise<RegisteredVoter[]> {
        return this.model.find(searchCriteria).exec();
    }

    update(updateData: Criteria<RegisteredVoter>, id: number): Promise<any> {
        return this.model.update({ id }, updateData).exec();
    }

    delete(deleteCriteria: Criteria<RegisteredVoter>): Promise<any> {
        return this.model.deleteMany(deleteCriteria).exec();
    }
}
