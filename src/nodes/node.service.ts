import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { Model } from 'mongoose';
import { Node } from './interfaces/node.interface';
import { NodeDto } from './dto/create-node.dto';
import { RSAService } from '../crypto/rsa.service';
import { isString } from 'util';
import { ConfigService } from '../config/config.service';
import { readFileSync } from 'fs';

@Injectable()
export class NodeService {

  constructor(
    private readonly RSAService: RSAService,
    private readonly configService: ConfigService,
    @Inject('NodeModelToken') private readonly nodeModel: Model<Node>
  ) {}

  //TODO: сделать валидацию средствами class-validator (изучить с кастомными валидаторами)
  private async validateChainHeadNode(createNodeDto: NodeDto): Promise<void> {

    const adminPublicKey: string = readFileSync(this.configService.get('ADMIN_PUBLIC_KEY_PATH'), 'utf8').replace(/\r\n/g, '\n');

    //является ли автор админом
    if (adminPublicKey !== createNodeDto.authorPublicKey) {
      throw new BadRequestException('Incorrect chain head!', 'Incorrect authorPublicKey!');
    }

    //посмотреть корректность хеша (обьект со всеми полями за исключением hash и signature)
    let objectForCheck: object = {};
    Object.keys(createNodeDto)
      .filter(key => ['hash', 'signature'].indexOf(key) < 0)
      .forEach(key => objectForCheck[key] = createNodeDto[key]);
    const neededHash = await this.RSAService.getMsgHash(JSON.stringify(objectForCheck));
    if (createNodeDto.hash !== neededHash) {
      throw new BadRequestException('Incorrect chain head!', 'Incorrect hash!');
    }

    //проверить, если блок с таким хешем в базе
    const existedBlocks: Node[] = await this.nodeModel.find({hash: createNodeDto.hash});
    if (existedBlocks.length > 0) {
      throw new BadRequestException('Incorrect chain head!', 'Such node already exists!');
    }

    //type = 1
    //parentHash равен ''
    //authorPublicKey и votingPublicKey != ''
    //votingDescription != ''
    //startTime > NOW()
    //endTime > startTime
    const startTimeDt: Date = new Date(createNodeDto.startTime),
          endTimeDt: Date = new Date(createNodeDto.endTime);
    if (createNodeDto.type !== 1 ||
          createNodeDto.parentHash !== '' || 
          createNodeDto.authorPublicKey === '' || 
          createNodeDto.votingPublicKey === '' || 
          createNodeDto.votingDescription === '' || 
          startTimeDt <= (new Date()) ||
          startTimeDt >= endTimeDt) {
      throw new BadRequestException('Incorrect chain head!', 'Incorrect args!');
    }

    //votingPublicKey есть в базе со своим приватным собратом
    if( '' === await this.RSAService.getPrivateKeyByPublic(createNodeDto.votingPublicKey) ) {
      throw new BadRequestException('Incorrect chain head!', 'Incorrect votingPublicKey!');
    }
    //подпись валидна
    if ( ! await this.RSAService.verifyMsgSignature(JSON.stringify(objectForCheck), createNodeDto.signature, createNodeDto.authorPublicKey)) {
      throw new BadRequestException('Incorrect chain head!', 'Incorrect signature!');
    }

    //candidates is not empty string[]
    if (0 === createNodeDto.candidates.length || createNodeDto.candidates.some((candidate) => ! isString(candidate))) {
      throw new BadRequestException('Incorrect chain head!', 'Candidates are empty or incorrect!');
    }

    //registeredVoters is empty []
    if (0 !== createNodeDto.registeredVoters.length) {
      throw new BadRequestException('Incorrect chain head!', 'Registered voters is not empty!');
    }
  }

  //создание узла первого типа
  async createChain(createNodeDto: NodeDto): Promise<Node> {

    try {
      await this.validateChainHeadNode(createNodeDto);
      const createdNode = new this.nodeModel(createNodeDto);
      return await createdNode.save();
    } catch (e) {
      throw e;
    }
  }

  //создание узла второго типа
  async registerVoter(createNodeDto: NodeDto): Promise<Node> {

    //не забыть записать в коллекцию registeredVoters id зареганного юзера
    const createdNode = new this.nodeModel(createNodeDto);
    return await createdNode.save();
  }

  //создание узла четвертого типа
  async registerVote(createNodeDto: NodeDto): Promise<Node> {

    const createdNode = new this.nodeModel(createNodeDto);
    return await createdNode.save();
  }

  //поиск узла по хешу
  async findByHash(hash: string): Promise<Node> {
    let foundNode: Node = await this.nodeModel.findOne({hash: hash}).exec();
    if (foundNode)
      return foundNode;
    else
      throw new BadRequestException('Incorrect hash!', 'Node with specified hash does not exist!');
  }

  //исключительно для теста
  async deleteChainByHash(hash: string): Promise<boolean> {
    return await this.nodeModel.deleteOne({hash: hash});
  }
}