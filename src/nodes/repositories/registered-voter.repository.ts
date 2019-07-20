import BaseRepository, { Criteria } from '../../common/base.repository';
import { RegisteredVoter } from '../interfaces/registered-voter.interface';
import { Model } from 'mongoose';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export default class RegisteredVoterRepository extends BaseRepository<RegisteredVoter> {
    constructor(
        @Inject('RegisteredVoterModelToken')
        registeredVoterModel: Model<RegisteredVoter>,
    ) {
        super(registeredVoterModel);
    }

    create(votingHash: string, voterId: number): Promise<RegisteredVoter> {
        return new this.registeredVoterModel({ hash: votingHash, registeredVoterId: voterId }).save();
    }

    findAll(): Promise<RegisteredVoter[]> {
        return this.registeredVoterModel.find().exec();
    }

    findById(id: number): Promise<RegisteredVoter> {
        return this.registeredVoterModel.findById(id).exec();
    }

    findOneByAndCriteria(searchCriteria: Criteria<RegisteredVoter>): Promise<RegisteredVoter> {
        return this.registeredVoterModel.findOne(searchCriteria).exec();
    }

    findByAndCriteria(searchCriteria: Criteria<RegisteredVoter>): Promise<RegisteredVoter[]> {
        return this.registeredVoterModel.find(searchCriteria).exec();
    }

    update(updateData: Criteria<RegisteredVoter>, id: number): Promise<any> {
        return this.registeredVoterModel.update({ id }, updateData).exec();
    }

    delete(deleteCriteria: Criteria<RegisteredVoter>): Promise<any> {
        return this.registeredVoterModel.deleteMany(deleteCriteria).exec();
    }
}
