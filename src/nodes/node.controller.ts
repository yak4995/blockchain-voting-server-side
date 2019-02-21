import { 
    Controller, 
    Get, 
    UseGuards, 
    Post, 
    Body,
    UsePipes,
    Inject,
    Param
} from '@nestjs/common';
import { NodeService } from './node.service';
import { Node } from './interfaces/node.interface';
import { NodeDto } from './dto/create-node.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AppLogger } from '../logger/app-logger.service';
import { ValidatorPipe } from '../common/validator.pipe';
import { ParseStringPipe } from '../common/parse-string.pipe';

@Controller('nodes')
export class NodeController {

  constructor(
    private readonly nodeService: NodeService,
    @Inject('logger') private readonly loggerService: AppLogger
  ) {}

  //получение узла по переданному хешу
  @Get(':hash')
  async getNodeByHash(@Param('hash', ParseStringPipe) hash: string): Promise<Node> {

    try {
      return await this.nodeService.findByHash(hash);
    } catch (e) {
      this.loggerService.error(e.message.error, e.trace);
      throw e;
    }
  }

  //получение "родительского узла" по хешу прямого потомка
  @Get('parent/:hash')
  async getParentNodeByHash(@Param('hash', ParseStringPipe) hash: string): Promise<Node> {

    try {
      return await this.nodeService.findParentByHash(hash);
    } catch (e) {
      this.loggerService.error(e.message.error, e.trace);
      throw e;
    }
  }

  //получить все узлы (выборы) первого типа в системе
  @Get()
  async getAllChainHeads(): Promise<Node[]> {

    try {
      return await this.nodeService.getAllChainHeads();
    } catch (e) {
      this.loggerService.error(e.message.error, e.trace);
      throw e;
    }
  }

  //поиск головы цепочки по хешу узла, который в этой цепочке состоит
  @Get('head-by-hash/:hash')
  async getChainHeadBySomeChildHash(@Param('hash', ParseStringPipe) hash: string): Promise<Node> {

    try {
      return await this.nodeService.findChainHeadByNodeHash(hash);
    } catch (e) {
      this.loggerService.error(e.message.error, e.trace);
      throw e;
    }
  }

  //получение "прямых детей" узла
  @Get('children/:hash')
  async getChainChildren(@Param('hash', ParseStringPipe) hash: string): Promise<Node[]> {
    
    try {
      return await this.nodeService.findNodeChildren(hash);
    } catch (e) {
      this.loggerService.error(e.message.error, e.trace);
      throw e;
    }
  }

  //получить последний узел в цепочке, за исключением 4 типа
  @Get('last/:hash')
  async getLastChainNode(@Param('hash', ParseStringPipe) hash: string): Promise<Node> {

    try {
      return await this.nodeService.getLastChainNode(hash);
    } catch (e) {
      this.loggerService.error(e.message.error, e.trace);
      throw e;
    }
  }

  @Get('get-last-vote/:hash')
  async getLastVote(@Param('hash', ParseStringPipe) voteNodeHash: string): Promise<Node> {

    try {
      return await this.nodeService.getLastVote(voteNodeHash);
    } catch (e) {
      this.loggerService.error(e.message.error, e.trace);
      throw e;
    }
  }

  //создание узла первого типа (требует авторизации, потому что регистрируют выборы только с узла-клиента)
  @Post('create-chain')
  @UseGuards(JwtAuthGuard) //AuthGuard так как мы не передали ему стратегию, использует её по умолч. (для OAuth2 пришлось бы передать 'bearer')
  @UsePipes(ValidatorPipe)
  async createChain(@Body() createNodeDto: NodeDto): Promise<Node> {

    try {
      return await this.nodeService.createChain(createNodeDto);
    } catch (e) {
      this.loggerService.error(e.message.error, e.trace);
      throw e;
    }
  }

  //создание узла второго типа
  @Post('register-voter/:voterId/:accessToken')
  @UsePipes(ValidatorPipe)
  async registerVoter(@Body() createNodeDto: NodeDto,
                      @Param('voterId') voterId: number,
                      @Param('accessToken') accessToken: string): Promise<Node> {
    
    try {
      return await this.nodeService.registerVoter(createNodeDto, voterId, accessToken);
    } catch (e) {
      this.loggerService.error(e.message.error, e.trace);
      throw e;
    }
  }

  //создание узла четвертого типа
  @Post('vote')
  @UsePipes(ValidatorPipe)
  async registerVote(@Body() createNodeDto: NodeDto): Promise<Node> {

    try {
      return await this.nodeService.registerVote(createNodeDto);
    } catch (e) {
      this.loggerService.error(e.message.error, e.trace);
      throw e;
    }
  }

  //исключительно для тестов
  async deleteChain(hash: string): Promise<boolean> {

    return await this.nodeService.deleteChainByHash(hash);
  }
}