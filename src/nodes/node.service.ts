import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Node } from './interfaces/node.interface';
import { NodeDto } from './dto/create-node.dto';

@Injectable()
export class NodeService {

  constructor(@InjectModel('Node') private readonly nodeModel: Model<Node>) {}

  //создание узла первого типа
  async createChain(createNodeDto: NodeDto): Promise<Node> {
    const createdNode = new this.nodeModel(createNodeDto);
    return await createdNode.save();
  }

  //создание узла второго типа
  async registerVoter(createNodeDto: NodeDto): Promise<Node> {
    const createdNode = new this.nodeModel(createNodeDto);
    return await createdNode.save();
  }

  //создание узла четвертого типа
  async registerVote(createNodeDto: NodeDto): Promise<Node> {
    const createdNode = new this.nodeModel(createNodeDto);
    return await createdNode.save();
  }

  async findAll(): Promise<Node[]> {
    return await this.nodeModel.find().exec();
  }
}