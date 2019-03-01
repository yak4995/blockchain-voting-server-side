import { Controller, Get, UseGuards, Post, Body, UsePipes, Inject, Param, BadRequestException } from '@nestjs/common';
import { Node } from './interfaces/node.interface';
import { NodeDto } from './dto/create-node.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AppLogger } from '../logger/app-logger.service';
import { ValidatorPipe } from '../common/validator.pipe';
import { ParseStringPipe } from '../common/parse-string.pipe';
import { NodeReadService } from './services/node-read.service';
import { NodePersistanceService } from './services/node-persistance.service';
import { Queue } from 'bull';
import { InjectQueue } from 'nest-bull';

@Controller('nodes')
export class NodeController {
  constructor(
    private readonly nodeReadService: NodeReadService,
    private readonly nodePersistanceService: NodePersistanceService,
    @InjectQueue('store') private readonly queue: Queue,
    @Inject('logger') private readonly loggerService: AppLogger,
  ) {}

  async broadcastNode(node: Node): Promise<void> {
    await this.queue.add(node, {
      removeOnComplete: true,
      removeOnFail: true,
    });
  }

  // получение узла по переданному хешу
  @Get(':hash')
  async getNodeByHash(@Param('hash', ParseStringPipe) hash: string): Promise<Node> {
    try {
      return await this.nodeReadService.findByHash(hash);
    } catch (e) {
      this.loggerService.error(e.message.error, e.trace);
      throw e;
    }
  }

  // получение "родительского узла" по хешу прямого потомка
  @Get('parent/:hash')
  async getParentNodeByHash(@Param('hash', ParseStringPipe) hash: string): Promise<Node> {
    try {
      return await this.nodeReadService.findParentByHash(hash);
    } catch (e) {
      this.loggerService.error(e.message.error, e.trace);
      throw e;
    }
  }

  // получить все узлы (выборы) первого типа в системе
  @Get()
  async getAllChainHeads(): Promise<Node[]> {
    try {
      return await this.nodeReadService.getAllChainHeads();
    } catch (e) {
      this.loggerService.error(e.message.error, e.trace);
      throw e;
    }
  }

  // поиск головы цепочки по хешу узла, который в этой цепочке состоит
  @Get('head-by-hash/:hash')
  async getChainHeadBySomeChildHash(@Param('hash', ParseStringPipe) hash: string): Promise<Node> {
    try {
      return await this.nodeReadService.findChainHeadByNodeHash(hash);
    } catch (e) {
      this.loggerService.error(e.message.error, e.trace);
      throw e;
    }
  }

  // получение "прямых детей" узла
  @Get('children/:hash')
  async getChainChildren(@Param('hash', ParseStringPipe) hash: string): Promise<Node[]> {
    try {
      return await this.nodeReadService.findNodeChildren(hash);
    } catch (e) {
      this.loggerService.error(e.message.error, e.trace);
      throw e;
    }
  }

  // получить последний узел в цепочке, за исключением 4 типа
  @Get('last/:hash')
  async getLastChainNode(@Param('hash', ParseStringPipe) hash: string): Promise<Node> {
    try {
      return await this.nodeReadService.getLastChainNode(hash);
    } catch (e) {
      this.loggerService.error(e.message.error, e.trace);
      throw e;
    }
  }

  @Get('get-last-vote/:hash')
  async getLastVote(@Param('hash', ParseStringPipe) voteNodeHash: string): Promise<Node> {
    try {
      return await this.nodeReadService.getLastVote(voteNodeHash);
    } catch (e) {
      this.loggerService.error(e.message.error, e.trace);
      throw e;
    }
  }

  // создание узла первого типа (требует авторизации, потому что регистрируют выборы только с узла-клиента)
  @Post('create-chain')
  @UseGuards(JwtAuthGuard) // AuthGuard так как мы не передали ему стратегию, использует её по умолч. (для OAuth2 пришлось бы передать 'bearer')
  @UsePipes(ValidatorPipe)
  async createChain(@Body() createNodeDto: NodeDto): Promise<Node> {
    try {
      const createdNode: Node = await this.nodePersistanceService.createChain(createNodeDto);
      // хоть и асинхронная задача, но мы не ждем подтверждения, используя await
      this.broadcastNode(createdNode);
      return createdNode;
    } catch (e) {
      this.loggerService.error(e.message.error, e.trace);
      throw e;
    }
  }

  // создание узла второго типа
  @Post('register-voter/:voterId/:accessToken')
  @UsePipes(ValidatorPipe)
  async registerVoter(@Body() createNodeDto: NodeDto, @Param('voterId') voterId: number, @Param('accessToken') accessToken: string): Promise<Node> {
    try {
      const createdNode: Node = await this.nodePersistanceService.registerVoter(createNodeDto, voterId, accessToken);
      this.broadcastNode(createdNode);
      return createdNode;
    } catch (e) {
      this.loggerService.error(e.message.error, e.trace);
      throw e;
    }
  }

  // создание узла четвертого типа
  @Post('vote')
  @UsePipes(ValidatorPipe)
  async registerVote(@Body() createNodeDto: NodeDto): Promise<Node> {
    try {
      const createdNode: Node = await this.nodePersistanceService.registerVote(createNodeDto);
      this.broadcastNode(createdNode);
      return createdNode;
    } catch (e) {
      this.loggerService.error(e.message.error, e.trace);
      throw e;
    }
  }

  // внешний узел (сервера добавляются/удаляются в базу вручную)
  @Post('get-external-node')
  @UsePipes(ValidatorPipe)
  async getExternalNode(@Body() externalNodeDto: NodeDto): Promise<Node> {
    try {
      const createdNode: Node = await this.nodePersistanceService.pushExternalNode(externalNodeDto);
      await this.broadcastNode(createdNode);
      return createdNode;
    } catch (e) {
      this.loggerService.error(e.message.error, e.trace);
      throw e;
    }
  }
}
