import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Node } from './interfaces/node.interface';
import { NodeDto } from './dto/create-node.dto';
import { RSAService } from './rsa.service';

@Injectable()
export class NodeService {

  constructor(@InjectModel('KeyPair') private readonly nodeModel: Model<Node>, private readonly RSAService: RSAService) {}

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

  //TODO: получать узлы только указанной цепочки
  async findAll(): Promise<Node[]> {
    return await this.nodeModel.find().exec();
  }
}