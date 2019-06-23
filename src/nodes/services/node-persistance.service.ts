import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { Model } from 'mongoose';
import { Node } from '../interfaces/node.interface';
import { NodeDto } from '../dto/create-node.dto';
import { RSAService } from '../../crypto/rsa.service';
import { NodeValidationService } from './node-validation.service';
import { RegisteredVotersService } from './registered-voters.service';
import { NodeReadService } from './node-read.service';
import { Queue } from 'bull';
import { InjectQueue } from 'nest-bull';

@Injectable()
export class NodePersistanceService {
  private readonly ERROR_TEXT = 'Incorrect node!';

  constructor(
    private readonly rsaService: RSAService,
    private readonly nodeValidationService: NodeValidationService,
    private readonly nodeReadService: NodeReadService,
    private readonly registeredVotersService: RegisteredVotersService,
    @Inject('NodeModelToken') private readonly nodeModel: Model<Node>,
    @InjectQueue('store') private readonly queue: Queue,
  ) {}

  async getNodeWithHashAndSign(startNodeObj: object, privateKey: string): Promise<NodeDto> {
    const result: NodeDto = new NodeDto();
    Object.keys(startNodeObj).forEach(key => (result[key] = startNodeObj[key]));
    result.hash = await this.rsaService.getObjHash(startNodeObj);
    result.signature = await this.rsaService.getObjSignature(startNodeObj, privateKey);
    return result;
  }

  // создание узла первого типа
  async createChain(createNodeDto: NodeDto): Promise<Node> {
    await this.nodeValidationService.validateChainHeadNode(createNodeDto, false);
    return await new this.nodeModel(createNodeDto).save();
  }

  // создание узла второго типа
  async registerVoter(createNodeDto: NodeDto, voterId: number, accessToken: string): Promise<Node> {
    await this.nodeValidationService.validateVoter(voterId, accessToken);
    await this.nodeValidationService.validateRegisterVoterNode(createNodeDto, voterId);
    // сгенерить хеш и подпись
    const fullNode: NodeDto = await this.getNodeWithHashAndSign(
      this.nodeValidationService.getNodeForCryptoCheck(createNodeDto),
      await this.rsaService.getPrivateKeyByPublic(createNodeDto.authorPublicKey),
    );

    await this.registeredVotersService.persistRegisteredVoter(
      (await this.nodeReadService.findChainHeadByNodeHash(createNodeDto.parentHash)).hash,
      voterId,
    );
    return await new this.nodeModel(fullNode).save();
  }

  // создание узла третьего типа (через CLI)
  async startVoting(createNodeDto: NodeDto): Promise<Node> {
    const createdNode: Node = await new this.nodeModel(createNodeDto).save();
    await this.queue.add(createdNode, {
      removeOnComplete: true,
      removeOnFail: true,
    });
    return createdNode;
  }

  // создание узла четвертого типа
  async registerVote(createNodeDto: NodeDto): Promise<Node> {
    await this.nodeValidationService.validateVoteNode(createNodeDto);
    return await new this.nodeModel(createNodeDto).save();
  }

  async pushExternalNode(externalNodeDto: NodeDto): Promise<Node> {
    // проверить есть ли нода с таким хешем в базе и кинуть exception, если есть
    try {
      await this.nodeReadService.findByHash(externalNodeDto.hash);
      throw new BadRequestException(this.ERROR_TEXT, 'Such node already exists!');
    } catch (e) {
      if (e.message.error !== 'Current node with specified hash does not exist!') {
        throw new BadRequestException(this.ERROR_TEXT, 'Such node already exists!');
      }
    }
    await this.nodeValidationService.validateExternalNode(externalNodeDto);
    return await new this.nodeModel(externalNodeDto).save();
  }
}
