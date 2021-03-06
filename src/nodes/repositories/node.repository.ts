import BaseRepository, { Criteria } from '../../common/base.repository';
import { Node } from '../interfaces/node.interface';
import { Model } from 'mongoose';
import { Inject, Injectable } from '@nestjs/common';
import { NodeDto } from '../dto/create-node.dto';
import { INode } from '../interfaces/i-node.interface';

@Injectable()
export default class NodeRepository extends BaseRepository<INode> {
    constructor(@Inject('NodeModelToken') private readonly model: Model<Node>) {
        super();
    }

    create(createNodeDto: NodeDto): Promise<Node> {
        return new this.model(createNodeDto).save();
    }

    findAll(): Promise<Node[]> {
        return this.model.find().exec();
    }

    findById(id: number): Promise<Node> {
        return this.model.findById(id).exec();
    }

    findOneByAndCriteria(searchCriteria: Criteria<Node>): Promise<Node> {
        return this.model.findOne(searchCriteria).exec();
    }

    findByAndCriteria(searchCriteria: Criteria<Node>): Promise<Node[]> {
        return this.model.find(searchCriteria).exec();
    }

    update(updateData: Criteria<Node>, id: number): Promise<any> {
        return this.model.update({ id }, updateData).exec();
    }

    delete(deleteCriteria: Criteria<Node>): Promise<any> {
        return this.model.deleteMany(deleteCriteria).exec();
    }
}
