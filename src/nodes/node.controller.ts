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

  //создание узла первого типа (требует авторизации, потому что регистрируют выборы только с узла-клиента)
  @Post('create-chain')
  @UseGuards(JwtAuthGuard) //AuthGuard так как мы не передали ему стратегию, использует её по умолч. (для OAuth2 пришлось бы передать 'bearer')
  @UsePipes(ValidatorPipe)
  async createChain(@Body() createNodeDto: NodeDto) {

    try {
      return await this.nodeService.createChain(createNodeDto);
    } catch (e) {
      this.loggerService.error(e.message.error, e.trace);
      throw e;
    }
  }

  //создание узла второго типа
  @Post('register-voter')
  @UsePipes(ValidatorPipe)
  async registerVoter(@Body() createNodeDto: NodeDto) {

    return await this.nodeService.registerVoter(createNodeDto);
  }

  //создание узла четвертого типа
  @Post('vote')
  @UsePipes(ValidatorPipe)
  async registerVote(@Body() createNodeDto: NodeDto) {

    return await this.nodeService.registerVote(createNodeDto);
  }

  //исключительно для тестов
  async deleteChain(hash: string) {

    return await this.nodeService.deleteChainByHash(hash);
  }
}