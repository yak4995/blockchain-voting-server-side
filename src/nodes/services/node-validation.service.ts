import { Injectable, Inject, BadRequestException } from "@nestjs/common";
import { readFileSync } from 'fs';
import { Model } from "mongoose";
import { AxiosService } from "../../axios/axios.service";
import { ConfigService } from "../../config/config.service";
import { RSAService } from "../../crypto/rsa.service";
import { Node } from '../interfaces/node.interface';
import { NodeDto } from "../dto/create-node.dto";
import { NodeReadService } from "./node-read.service";
import { RegisteredVotersService } from "./registered-voters.service";

@Injectable()
export class NodeValidationService {
  
  private readonly ERROR_TEXT = 'Incorrect node!';

  constructor(
    private readonly RSAService: RSAService,
    private readonly configService: ConfigService,
    private readonly axiosService: AxiosService,
    private readonly nodeReadService: NodeReadService,
    private readonly registeredVotersService: RegisteredVotersService,
    @Inject('NodeModelToken') private readonly nodeModel: Model<Node>
  ) {}

  //получаем обьект узла за исключением полей хеша и подписи. Используется для генерации/проверки хеша и подписи
  getNodeForCryptoCheck(createNodeDto: NodeDto): object {

    let objectForCheck: object = {};
    Object.keys(createNodeDto)
      .filter(key => ! ['hash', 'signature'].includes(key))
      .forEach(key => objectForCheck[key] = createNodeDto[key]);
    return objectForCheck;
  }

  //валидация узла первого типа:
  async validateChainHeadNode(createNodeDto: NodeDto): Promise<void> {

    const adminPublicKey: string = readFileSync(this.configService.get('ADMIN_PUBLIC_KEY_PATH'), 'utf8').replace(/\r\n/g, '\n');

    //является ли автор админом
    if (adminPublicKey !== createNodeDto.authorPublicKey) {
      throw new BadRequestException(this.ERROR_TEXT, 'Incorrect authorPublicKey!');
    }

    const objectForCheck: object = this.getNodeForCryptoCheck(createNodeDto);

    //посмотреть корректность хеша
    const neededHash = await this.RSAService.getMsgHash(JSON.stringify(objectForCheck));
    if (createNodeDto.hash !== neededHash) {
      throw new BadRequestException(this.ERROR_TEXT, 'Incorrect hash!');
    }

    //проверить, если блок с таким хешем в базе
    try {
      const existedBlocks: Node = await this.nodeReadService.findByHash(createNodeDto.hash);
      throw new BadRequestException(this.ERROR_TEXT, 'Such node already exists!');
    } catch (e) {}

    //type = 1
    //startTime > NOW()
    //endTime > startTime
    const startTimeDt: Date = new Date(createNodeDto.startTime),
          endTimeDt: Date = new Date(createNodeDto.endTime);
    if (1 !== createNodeDto.type ||
          startTimeDt <= (new Date()) ||
          startTimeDt >= endTimeDt) {
      throw new BadRequestException(this.ERROR_TEXT, 'Incorrect type or dates!');
    }

    //votingPublicKey есть в базе со своим приватным собратом
    if('' === await this.RSAService.getPrivateKeyByPublic(createNodeDto.votingPublicKey)) {
      throw new BadRequestException(this.ERROR_TEXT, 'Incorrect votingPublicKey!');
    }
    
    //подпись валидна
    if ( ! await this.RSAService.verifyMsgSignature(JSON.stringify(objectForCheck), createNodeDto.signature, createNodeDto.authorPublicKey)) {
      throw new BadRequestException(this.ERROR_TEXT, 'Incorrect signature!');
    }
  }

  //валидация узла второго типа:
  async validateRegisterVoterNode(createNodeDto: NodeDto, voterId: number): Promise<void> {

    //type = 2
    if (2 !== createNodeDto.type)
      throw new BadRequestException(this.ERROR_TEXT, 'Incorrect type!');

    //проверить наличие блока-родителя (и с типом 1 или 2)
    let parentNode: Node = null;
    try {
      parentNode = await this.nodeReadService.findByHash(createNodeDto.parentHash);
    } catch (e) {
      throw new BadRequestException(this.ERROR_TEXT, 'Node with specified parent hash doesn`t exist!');
    }

    //нет ли у родителя других потомков
    if ((await this.nodeReadService.findNodeChildren(parentNode.hash)).length > 0) {
      throw new BadRequestException(this.ERROR_TEXT, 'Parent node already have children!');
    }

    const chainHeadNode: Node = await this.nodeReadService.findChainHeadByNodeHash(parentNode.hash);
    //не начались ли еще выборы
    if (new Date(chainHeadNode.startTime) <= (new Date())) {
      throw new BadRequestException(this.ERROR_TEXT, 'The voting already has been started!');
    }

    //допущен ли этот избиратель к этим выборам
    if (! chainHeadNode.admittedVoters.includes(voterId)) {
      throw new BadRequestException(this.ERROR_TEXT, 'This user isn`t admitted voter of the voting!');
    }

    //автор - публичный ключ выборов
    if (createNodeDto.authorPublicKey !== chainHeadNode.votingPublicKey) {
      throw new BadRequestException(this.ERROR_TEXT, 'You have to write voting public key in author field!');
    }

    //не регался ли уже этот пользователь на эти выборы
    if (await this.registeredVotersService.isRegisteredVoter(chainHeadNode.hash, voterId)) {
      throw new BadRequestException(this.ERROR_TEXT, 'This user has been registered in the voting already!');
    }

    //не регался ли еще этот admittedUserPublicKey
    if (await this.isAdmittedVoter(createNodeDto.parentHash, createNodeDto.admittedUserPublicKey)) {
      throw new BadRequestException(this.ERROR_TEXT, 'This public key has been registered in the voting already!');
    }
  }

  //валидация желающего зарегистрироваться избирателя через аутентификацию на клиенте:
  async validateVoter(voterId: number, accessToken: string): Promise<void> {

    const { id } = await this.axiosService.getUserByAccessToken(accessToken); //деструктуризация
    if (id != voterId) //потому что id - это строка
      throw new BadRequestException(this.ERROR_TEXT, 'This access token invalid for this user!');
  }

  //проверка, регистрировался ли такой публичный ключ на выборах
  async isAdmittedVoter(someNodeHash: string, checkingPublicKey: string): Promise<boolean> {

    let currentNode = await this.nodeReadService.findByHash(someNodeHash);
    while (currentNode.type > 1) {
      currentNode = await this.nodeReadService.findByHash(currentNode.parentHash);
      if (2 === currentNode.type && checkingPublicKey === currentNode.admittedUserPublicKey) {
        return true;
      }
    }
    return false;
  }

  //валидация узла четвертого типа:
  async validateVoteNode(createNodeDto: NodeDto): Promise<void> {

    //type = 4
    if (4 !== createNodeDto.type)
      throw new BadRequestException(this.ERROR_TEXT, 'Incorrect type!');
    
    //хеш и подпись валидны
    const objectForCheck: object = this.getNodeForCryptoCheck(createNodeDto);

    const neededHash = await this.RSAService.getMsgHash(JSON.stringify(objectForCheck));
    if (createNodeDto.hash !== neededHash)
      throw new BadRequestException(this.ERROR_TEXT, 'Incorrect hash!');
    
    if ( ! await this.RSAService.verifyMsgSignature(JSON.stringify(objectForCheck), createNodeDto.signature, createNodeDto.authorPublicKey))
      throw new BadRequestException(this.ERROR_TEXT, 'Incorrect signature!');
    
    //проверить существование родителя и его тип (кинет exception, если родителя не существует)
    const parentNode: Node = await this.nodeReadService.findByHash(createNodeDto.parentHash);
    //нет ли у родителя других потомков, если тип 4, или уже голоса с этим ключом, если тип 3
    const parentNodeChildren: Node[] = await this.nodeReadService.findNodeChildren(parentNode.hash);
    switch (parentNode.type) {
      case 3:
        if (await this.nodeReadService.getFirstVoteByStartNodeHash(parentNode.hash, createNodeDto.authorPublicKey)) {
          throw new BadRequestException(this.ERROR_TEXT, 'Start voting node already have votes with this author key! You must note your last vote as parent node');
        }
        break;
      case 4:
        if (parentNodeChildren.length > 0) {
          throw new BadRequestException(this.ERROR_TEXT, 'Parent node already have children!');
        }
        break;
      default:
        throw new BadRequestException(this.ERROR_TEXT, 'Parent node must have type 3 or 4!');
    }

    //не начались ли еще выборы (получить тип 3)
    let startVotingNode: Node = null;
    if (parentNode.type === 3) {
      startVotingNode = parentNode;
    } else {
      startVotingNode = await this.nodeReadService.getStartVotingNodeByAnyVoteHash(parentNode.hash);
    }
    if (new Date(startVotingNode.startTime) > new Date() || new Date(startVotingNode.endTime) < new Date()) {
      throw new BadRequestException(this.ERROR_TEXT, 'Voting have not started or already have finished!');
    }

    //корректность кандидата (получить тип 3)
    if ( ! startVotingNode.candidates.includes(createNodeDto.selectedVariant))
      throw new BadRequestException(this.ERROR_TEXT, 'Selected candidate doesn`t exist!');

    //зарегистрирован ли ключ автора на эти выборы (получить тип 3)
    if ( ! await this.isAdmittedVoter(startVotingNode.hash, createNodeDto.authorPublicKey))
      throw new BadRequestException(this.ERROR_TEXT, 'Your are not registered voter!');
  }
}