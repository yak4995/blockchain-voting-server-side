import { 
    Controller, 
    Get, 
    UseGuards, 
    Post, 
    Body, 
    Res, 
    UsePipes,
    HttpStatus, 
    Inject
} from '@nestjs/common';
import { NodeService } from './node.service';
import { Node } from './interfaces/node.interface';
import { NodeDto } from './dto/create-node.dto';
import { JwtAuthGuard } from 'auth/guards/jwt-auth.guard';
import { AppLogger } from 'logger/app-logger.service';
import { ValidatorPipe } from '../common/validator.pipe';

@Controller('nodes')
export class NodeController {

  constructor(
    private readonly nodeService: NodeService,
    @Inject('logger') private readonly loggerService: AppLogger
  ) {}

  //TODO: превратить этот метод в несколько: получение узла по хешу, получение предка узла по хешу, получение потомков узла по хешу
  @Get()
  async root(): Promise<Node[]> {

    return this.nodeService.findAll();
  }

  //создание узла первого типа (требует авторизации, потому что регистрируют выборы только с узла-клиента)
  @Post('create-chain')
  @UseGuards(JwtAuthGuard) //AuthGuard так как мы не передали ему стратегию, использует её по умолч. (для OAuth2 пришлось бы передать 'bearer')
  @UsePipes(ValidatorPipe)
  async createChain(@Res() res, @Body() createNodeDto: NodeDto) {

    let createdNode: Node = await this.nodeService.createChain(createNodeDto);
    return res.status(HttpStatus.CREATED).json(createdNode);
  }

  //создание узла второго типа
  @Post('register-voter')
  @UsePipes(ValidatorPipe)
  async registerVoter(@Res() res, @Body() createNodeDto: NodeDto) {

    let createdNode: Node = await this.nodeService.registerVoter(createNodeDto);
    return res.status(HttpStatus.CREATED).json(createdNode);
  }

  //создание узла четвертого типа (при необходимости создаёт узел третьего типа)
  @Post('vote')
  @UsePipes(ValidatorPipe)
  async registerVote(@Res() res, @Body() createNodeDto: NodeDto) {

    let createdNode: Node = await this.nodeService.registerVote(createNodeDto);
    return res.status(HttpStatus.CREATED).json(createdNode);
  }
}