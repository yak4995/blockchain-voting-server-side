import BaseRepository, { Criteria } from '../../common/base.repository';
import { Model } from 'mongoose';
import { Inject, Injectable } from '@nestjs/common';
import { KnownServer } from 'nodes/interfaces/known-server.interface';

@Injectable()
export default class KnownServerRepository extends BaseRepository<KnownServer> {
    constructor(
        @Inject('KnownServersModelToken')
        knownServerModel: Model<KnownServer>,
    ) {
        super(knownServerModel);
    }

    create(url: string): Promise<KnownServer> {
        return new this.model({ url }).save();
    }

    findAll(): Promise<KnownServer[]> {
        return this.model.find().exec();
    }

    findById(id: number): Promise<KnownServer> {
        return this.model.findById(id).exec();
    }

    findOneByAndCriteria(searchCriteria: Criteria<KnownServer>): Promise<KnownServer> {
        return this.model.findOne(searchCriteria).exec();
    }

    findByAndCriteria(searchCriteria: Criteria<KnownServer>): Promise<KnownServer[]> {
        return this.model.find(searchCriteria).exec();
    }

    update(updateData: Criteria<KnownServer>, id: number): Promise<any> {
        return this.model.update({ id }, updateData).exec();
    }

    delete(deleteCriteria: Criteria<KnownServer>): Promise<any> {
        return this.model.deleteMany(deleteCriteria).exec();
    }
}
