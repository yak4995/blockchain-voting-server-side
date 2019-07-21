import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { RSAService } from '../../crypto/rsa.service';
import { NodeValidationService } from './node-validation.service';
import { RegisteredVotersService } from './registered-voters.service';
import { NodeReadService } from './node-read.service';
import { Queue } from 'bull';
import { InjectQueue } from 'nest-bull';
import BaseRepository from '../../common/base.repository';
import { INode } from '../interfaces/i-node.interface';

@Injectable()
export class NodePersistanceService {
  private readonly ERROR_TEXT = 'Incorrect node!';

  constructor(
    private readonly rsaService: RSAService,
    private readonly nodeValidationService: NodeValidationService,
    private readonly nodeReadService: NodeReadService,
    private readonly registeredVotersService: RegisteredVotersService,
    @Inject('NodeRepository')
    private readonly nodeRepository: BaseRepository<INode>,
    @InjectQueue('store')
    private readonly queue: Queue,
  ) {}

  async getNodeWithHashAndSign(startNodeObj: object, privateKey: string): Promise<INode> {
    const result = Object.assign(
      Object.keys(startNodeObj).map(key => startNodeObj[key]) as {},
      { hash: '', signature: '' },
    ) as INode;
    [result.hash, result.signature] = await Promise.all([
      this.rsaService.getObjHash(startNodeObj),
      this.rsaService.getObjSignature(startNodeObj, privateKey),
    ]);
    return result;
  }

  // создание узла первого типа
  async createChain(createNodeDto: INode): Promise<INode> {
    await this.nodeValidationService.validateChainHeadNode(createNodeDto, false);
    return this.nodeRepository.create(createNodeDto);
  }

  // создание узла второго типа
  async registerVoter(createNodeDto: INode, voterId: number, accessToken: string): Promise<INode> {
    // если заключить две строки ниже в Promise.all, по неизвестной причине ломаются тесты
    await this.nodeValidationService.validateVoter(voterId, accessToken);
    await this.nodeValidationService.validateRegisterVoterNode(createNodeDto, voterId);
    const [privateKey, chainHead] = await Promise.all([
      this.rsaService.getPrivateKeyByPublic(createNodeDto.authorPublicKey),
      this.nodeReadService.findChainHeadByNodeHash(createNodeDto.parentHash),
    ]);
    const [fullNode] = await Promise.all([
      this.getNodeWithHashAndSign( // сгенерить хеш и подпись
        this.nodeValidationService.getNodeForCryptoCheck(createNodeDto),
        privateKey,
      ),
      this.registeredVotersService.persistRegisteredVoter(
        chainHead.hash,
        voterId,
      ),
    ]);
    return this.nodeRepository.create(fullNode);
  }

  // создание узла третьего типа (через CLI)
  async startVoting(createNodeDto: INode): Promise<INode> {
    const createdNode: INode = await this.nodeRepository.create(createNodeDto);
    await this.queue.add(createdNode, {
      removeOnComplete: true,
      removeOnFail: true,
    });
    return createdNode;
  }

  // создание узла четвертого типа
  async registerVote(createNodeDto: INode): Promise<INode> {
    await this.nodeValidationService.validateVoteNode(createNodeDto);
    return this.nodeRepository.create(createNodeDto);
  }

  async pushExternalNode(externalNodeDto: INode): Promise<INode> {
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
    return this.nodeRepository.create(externalNodeDto);
  }
}
