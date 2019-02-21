import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { readFileSync } from 'fs';
import { Model } from 'mongoose';
import { Node } from './interfaces/node.interface';
import { NodeDto } from './dto/create-node.dto';
import { RSAService } from '../crypto/rsa.service';
import { ConfigService } from '../config/config.service';
import { RegisteredVoter } from './interfaces/registered-voter.interface';
import { AxiosService } from '../axios/axios.service';

@Injectable()
export class NodeService {

  private readonly ERROR_TEXT = 'Incorrect node!';

  constructor(
    private readonly RSAService: RSAService,
    private readonly configService: ConfigService,
    private readonly axiosService: AxiosService,
    @Inject('NodeModelToken') private readonly nodeModel: Model<Node>,
    @Inject('RegisteredVoterModelToken') private readonly registeredVoterModel: Model<RegisteredVoter>
  ) {}

  //получаем обьект узла за исключением полей хеша и подписи. Используется для генерации/проверки хеша и подписи
  private getNodeForCryptoCheck(createNodeDto: NodeDto): object {

    let objectForCheck: object = {};
    Object.keys(createNodeDto)
      .filter(key => ! ['hash', 'signature'].includes(key))
      .forEach(key => objectForCheck[key] = createNodeDto[key]);
    return objectForCheck;
  }

  //Validation:

  //валидация узла первого типа:
  private async validateChainHeadNode(createNodeDto: NodeDto): Promise<void> {

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
    const existedBlocks: Node[] = await this.nodeModel.find({hash: createNodeDto.hash});
    if (existedBlocks.length > 0) {
      throw new BadRequestException(this.ERROR_TEXT, 'Such node already exists!');
    }

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
  private async validateRegisterVoterNode(createNodeDto: NodeDto, voterId: number): Promise<void> {

    //type = 2
    if (2 !== createNodeDto.type)
      throw new BadRequestException(this.ERROR_TEXT, 'Incorrect type!');

    //проверить наличие блока-родителя (и с типом 1 или 2)
    let parentNode: Node = null;
    try {
      parentNode = await this.findByHash(createNodeDto.parentHash);
    } catch (e) {
      throw new BadRequestException(this.ERROR_TEXT, 'Node with specified parent hash doesn`t exist!');
    }

    //нет ли у родителя других потомков
    if ((await this.findNodeChildren(parentNode.hash)).length > 0) {
      throw new BadRequestException(this.ERROR_TEXT, 'Parent node already have children!');
    }

    const chainHeadNode: Node = await this.findChainHeadByNodeHash(parentNode.hash);
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
    if (await this.isRegisteredVoter(chainHeadNode.hash, voterId)) {
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

    let currentNode = await this.findByHash(someNodeHash);
    while (currentNode.type > 1) {
      currentNode = await this.findByHash(currentNode.parentHash);
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
    const parentNode: Node = await this.findByHash(createNodeDto.parentHash);
    //нет ли у родителя других потомков, если тип 4, или уже голоса с этим ключом, если тип 3
    const parentNodeChildren: Node[] = await this.findNodeChildren(parentNode.hash);
    switch (parentNode.type) {
      case 3:
        if (await this.getFirstVoteByStartNodeHash(parentNode.hash, createNodeDto.authorPublicKey)) {
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
      startVotingNode = await this.getStartVotingNodeByAnyVoteHash(parentNode.hash);
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

  //RegisteredVotersService:

  //проверка, зарегестрирован ли избиратель на выборах по их узлу первого типа и ид юзера-избирателя
  async isRegisteredVoter(hash: string, voterId: number): Promise<boolean> {

    return await this.registeredVoterModel.findOne({hash: hash, registeredVoterId: voterId}).exec() !== null;
  }

  //сохранение зарегистрированого пользователя в базе
  private async persistRegisteredVoter(votingHash: string, voterId: number): Promise<RegisteredVoter> {

    return await (new this.registeredVoterModel({hash: votingHash, registeredVoterId: voterId})).save();
  }

  //Persistantion:

  //создание узла первого типа
  async createChain(createNodeDto: NodeDto): Promise<Node> {

    await this.validateChainHeadNode(createNodeDto);
    return await (new this.nodeModel(createNodeDto)).save();
  }

  //создание узла второго типа
  async registerVoter(createNodeDto: NodeDto, voterId: number, accessToken: string): Promise<Node> {

    await this.validateVoter(voterId, accessToken);
    await this.validateRegisterVoterNode(createNodeDto, voterId);
    //сгенерить хеш и подпись
    const objectForCheck: object = this.getNodeForCryptoCheck(createNodeDto);
    let fullNode: NodeDto = {
      hash: await this.RSAService.getObjHash(objectForCheck),
      parentHash: createNodeDto.parentHash,
      authorPublicKey: createNodeDto.authorPublicKey,
      signature: await this.RSAService.getObjSignature(objectForCheck, await this.RSAService.getPrivateKeyByPublic(createNodeDto.authorPublicKey)),
      type: 2,
      votingDescription: "",
      startTime: 0,
      endTime: 0,
      candidates: [],
      admittedVoters: [],
      registeredVoters: [],
      votingPublicKey: "",
      admittedUserPublicKey: createNodeDto.admittedUserPublicKey,
      selectedVariant: ""
    };
    await this.persistRegisteredVoter((await this.findChainHeadByNodeHash(fullNode.parentHash)).hash, voterId);
    return await (new this.nodeModel(fullNode)).save();
  }

  //создание узла третьего типа (через CLI)
  async startVoting(createNodeDto: NodeDto): Promise<Node> {

    return await (new this.nodeModel(createNodeDto)).save();
  }

  //создание узла четвертого типа
  async registerVote(createNodeDto: NodeDto): Promise<Node> {

    await this.validateVoteNode(createNodeDto);
    return await (new this.nodeModel(createNodeDto)).save();
  }

  //Reading:

  //получение всех выборов (узлов первого типа), пока без пагинации
  async getAllChainHeads(): Promise<Node[]> {

    return await this.nodeModel.find({type: 1}).exec();
  }

  //поиск узла по хешу
  async findByHash(hash: string): Promise<Node> {

    let foundNode: Node = await this.nodeModel.findOne({hash: hash}).exec();
    if (foundNode)
      return foundNode;
    else
      throw new BadRequestException('Incorrect hash!', 'Current node with specified hash does not exist!');
  }

  //поиск родительского узла по хешу
  async findParentByHash(hash: string): Promise<Node> {

    const foundParentNode = await this.nodeModel.findOne({hash: (await this.findByHash(hash)).parentHash}).exec();
    if (foundParentNode)
      return foundParentNode;
    else
      throw new BadRequestException('Incorrect hash!', 'Parent node does not exist!');
  }

  //поиск головы цепочки по хешу узла, который в этой цепочке состоит
  async findChainHeadByNodeHash(hash: string): Promise<Node> {

    let currentNode = await this.findByHash(hash);
    while (currentNode.type > 1) {
      currentNode = await this.findByHash(currentNode.parentHash);
    }
    return currentNode;
  }

  //получение "прямых детей" узла
  async findNodeChildren(hash: string): Promise<Node[]> {
    
    return await this.nodeModel.find({parentHash: hash}).exec();
  }

  //получить последний узел в цепочке, за исключением 4 типа
  async getLastChainNode(hash: string): Promise<Node> {

    let currentNode = await this.findByHash(hash);
    while (currentNode.type < 4) {
      let childNodes = await this.findNodeChildren(currentNode.hash);
      if (childNodes.length > 0 && childNodes[0].type !== 4) {
        currentNode = childNodes[0];
      } else {
        return currentNode;
      }
    }
    return currentNode;
  }

  //получение выборов, для которые уже начались, но еще не закончились
  async getAllChainHeadsInCurrentBoundaries(): Promise<Node[]> {

    const now: Date = new Date();
    //$gte - greater than or equal
    //$lt - less than
    return await this.nodeModel.find({type: 1, startTime: { $lt: now }, endTime: { $gte: now }}).exec();
  }

  //получение пользователей, зарегистрировавшихся на выборы с указанным хешем
  async getRegisteredVotersByVotingHash(votingHash: string): Promise<number[]> {

    let result: number[] =[];
    (await this.registeredVoterModel.find({hash: votingHash}).exec())
    .forEach((currentVoter: RegisteredVoter) => {
      result.push(currentVoter.registeredVoterId);
    });
    return result;
  }

  //удаление учета зарегистрироваавшихся избирателей для сохранения анонимности после начала выборов
  async purgeRegisteredVotersInfoByVotingHash(votingHash: string): Promise<void> {
    
    await this.registeredVoterModel.deleteMany({hash: votingHash}).exec();
  }

  //получить первый голос на выборах избирателя по хешу узла 3-ого типа и его публичного ключа
  async getFirstVoteByStartNodeHash(startVotingNodeHash: string, voterPublicKey: string): Promise<Node> {

    return await this.nodeModel.findOne({parentHash: startVotingNodeHash, authorPublicKey: voterPublicKey}).exec();
  }

  //получить последний(самый актуальный) голос избирателя по его публичному ключу и хешу узла 3-ого типа
  async getLastVote(voteNodeHash: string): Promise<Node> {

    //валидация узла startVotingNodeHash и voterPublicKey
    let result: Node = await this.findByHash(voteNodeHash);
    if (result.type !== 4)
      throw new BadRequestException('Incorrect hash!', 'Node with this hash doesn`t have type 4!');
    while (result) {
      const resultChildren = await this.findNodeChildren(result.hash);
      if (resultChildren.length > 0) {
        result = resultChildren[0];
      } else {
        return result;
      }
    }
    return result;
  }

  async getStartVotingNodeByAnyVoteHash(voteNodeHash: string): Promise<Node> {

    let result: Node = await this.findParentByHash(voteNodeHash);
    while (result.type > 3) {
      result = await this.findParentByHash(result.hash);
    }
    return result;
  }

  //TODO: убрать при рефакторинге, в тестах использовать мокинг
  //исключительно для тестов, метод удаления узла первого типа
  async deleteChainByHash(hash: string): Promise<boolean> {

    return await this.nodeModel.deleteOne({hash: hash});
  }
}