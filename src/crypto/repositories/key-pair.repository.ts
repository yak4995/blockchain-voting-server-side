import BaseRepository, { Criteria } from '../../common/base.repository';
import { Model } from 'mongoose';
import { Inject, Injectable } from '@nestjs/common';
import { KeyPair } from '../../crypto/interfaces/key-pair.interface';

@Injectable()
export default class KeyPairRepository extends BaseRepository<KeyPair> {
    constructor(
        @Inject('KeyPairModelToken')
        keyPairModel: Model<KeyPair>,
    ) {
        super(keyPairModel);
    }

    create(publicKey: string, privateKey: string): Promise<KeyPair> {
        return new this.model({ publicKey, privateKey }).save();
    }

    findAll(): Promise<KeyPair[]> {
        return this.model.find().exec();
    }

    findById(id: number): Promise<KeyPair> {
        return this.model.findById(id).exec();
    }

    findOneByAndCriteria(searchCriteria: Criteria<KeyPair>): Promise<KeyPair> {
        return this.model.findOne(searchCriteria).exec();
    }

    findByAndCriteria(searchCriteria: Criteria<KeyPair>): Promise<KeyPair[]> {
        return this.model.find(searchCriteria).exec();
    }

    update(updateData: Criteria<KeyPair>, id: number): Promise<any> {
        return this.model.update({ id }, updateData).exec();
    }

    delete(deleteCriteria: Criteria<KeyPair>): Promise<any> {
        return this.model.deleteMany(deleteCriteria).exec();
    }
}
