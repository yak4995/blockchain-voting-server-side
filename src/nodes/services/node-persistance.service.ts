import { Injectable, Inject } from '@nestjs/common';
import { Model } from 'mongoose';
import { Node } from '../interfaces/node.interface';
import { NodeDto } from '../dto/create-node.dto';
import { RSAService } from '../../crypto/rsa.service';
import { NodeValidationService } from './node-validation.service';
import { RegisteredVotersService } from './registered-voters.service';
import { NodeReadService } from './node-read.service';

@Injectable()
export class NodePersistanceService {
  constructor(
    private readonly rsaService: RSAService,
    private readonly nodeValidationService: NodeValidationService,
    private readonly nodeReadService: NodeReadService,
    private readonly registeredVotersService: RegisteredVotersService,
    @Inject('NodeModelToken') private readonly nodeModel: Model<Node>,
  ) {}

  // создание узла первого типа
  async createChain(createNodeDto: NodeDto): Promise<Node> {
    await this.nodeValidationService.validateChainHeadNode(createNodeDto);
    return await new this.nodeModel(createNodeDto).save();
  }

  // создание узла второго типа
  async registerVoter(createNodeDto: NodeDto, voterId: number, accessToken: string): Promise<Node> {
    await this.nodeValidationService.validateVoter(voterId, accessToken);
    await this.nodeValidationService.validateRegisterVoterNode(createNodeDto, voterId);
    // сгенерить хеш и подпись
    const objectForCheck: object = this.nodeValidationService.getNodeForCryptoCheck(createNodeDto);
    const fullNode: NodeDto = {
      hash: await this.rsaService.getObjHash(objectForCheck),
      parentHash: createNodeDto.parentHash,
      authorPublicKey: createNodeDto.authorPublicKey,
      signature: await this.rsaService.getObjSignature(objectForCheck, await this.rsaService.getPrivateKeyByPublic(createNodeDto.authorPublicKey)),
      type: 2,
      votingDescription: '',
      startTime: 0,
      endTime: 0,
      candidates: [],
      admittedVoters: [],
      registeredVoters: [],
      votingPublicKey: '',
      admittedUserPublicKey: createNodeDto.admittedUserPublicKey,
      selectedVariant: '',
    };

    await this.registeredVotersService.persistRegisteredVoter(
      (await this.nodeReadService.findChainHeadByNodeHash(createNodeDto.parentHash)).hash,
      voterId,
    );
    return await new this.nodeModel(fullNode).save();
  }

  // создание узла третьего типа (через CLI)
  async startVoting(createNodeDto: NodeDto): Promise<Node> {
    return await new this.nodeModel(createNodeDto).save();
  }

  // создание узла четвертого типа
  async registerVote(createNodeDto: NodeDto): Promise<Node> {
    await this.nodeValidationService.validateVoteNode(createNodeDto);
    return await new this.nodeModel(createNodeDto).save();
  }
}
