import { 
    Controller, 
    Get, 
    UseGuards, 
    Post, 
    Body, 
    Res, 
    UsePipes, 
    ValidationPipe, 
    HttpStatus 
} from '@nestjs/common';
import { NodeService } from './node.service';
import { Node } from './interfaces/node.interface';
import { NodeDto } from './dto/create-node.dto';
import { JwtAuthGuard } from 'auth/guards/jwt-auth.guard';
import { RSAService } from './rsa.service';
import { KeyPairDTO } from './dto/get-key-pair.dto';

@Controller('nodes')
export class NodeController {

  constructor(
    private readonly nodeService: NodeService,
    private readonly RSAService: RSAService
  ) {}

  //TODO: получать узлы только указанной цепочки (выборов)
  @Get()
  async root(): Promise<Node[]> {

    return this.nodeService.findAll();
  }

  //создаёт и сохраняет пару ключей, возвращая публичный ключ
  //(требует авторизации, потому что вызывается клиентом при создании выборов для генерирования ключа выборов)
  @Get('get-voting-pkey')
  @UseGuards(JwtAuthGuard)
  async getPublicKeyForVoting() {
    let keyPair: KeyPairDTO = await this.RSAService.generateKeyPair();
    await this.RSAService.saveKeyPair(keyPair);
    return keyPair.publicKey;
  }

  //endpoint-helper для получения пары ключей для избирателя (но без сохранения их в базе сервера)
  @Get('gen-keypair')
  async testGen() {

    return await this.RSAService.generateKeyPair();
  }

  //создание узла первого типа (требует авторизации, потому что регистрируют выборы только с узла-клиента)
  @Post('create-chain')
  @UseGuards(JwtAuthGuard) //AuthGuard так как мы не передали ему стратегию, использует её по умолч. (для OAuth2 пришлось бы передать 'bearer')
  @UsePipes(ValidationPipe)
  async createChain(@Res() res, @Body() createNodeDto: NodeDto) {

    let createdNode: Node = await this.nodeService.createChain(createNodeDto);
    return res.status(HttpStatus.CREATED).json(createdNode);
  }

  //создание узла второго типа
  @Post('register-voter')
  @UsePipes(ValidationPipe)
  async registerVoter(@Res() res, @Body() createNodeDto: NodeDto) {

    let createdNode: Node = await this.nodeService.registerVoter(createNodeDto);
    return res.status(HttpStatus.CREATED).json(createdNode);
  }

  //создание узла четвертого типа (при необходимости создаёт узел третьего типа)
  @Post('vote')
  @UsePipes(ValidationPipe)
  async registerVote(@Res() res, @Body() createNodeDto: NodeDto) {

    let createdNode: Node = await this.nodeService.registerVote(createNodeDto);
    return res.status(HttpStatus.CREATED).json(createdNode);
  }

  @Get('test-sign')
  async testSign() {

    const msg: object = {name: 'Yurii'};
    const privateKey = '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDns9uJZhyXSvvU\njE+CtkyV4BZl83dYZ97Iiz5D3EHCxjS/q2h4C+TuCOyLIP8UT98JL1SEdDuRZocX\n+nxuwaJ0zNodreqHfnw8R2uNxIwAlgunRkJQE0PlVlYJTFJcGphx8d2fZmKf2pN3\nsvvDKYG0HYMYBW/VNXfWH7RXI8fd2E+fnNpkkuQCX5v9C4Pxh7NedUXGqaQ7L8aY\n4knFFYLe9ul5pCKhLyJ1evNIde862aiYNi09a5LaKAgw1VqUZz/qBU1t7G9ebWUk\nnW6BWzgNiAlJDVh/WMrmumPBingxqyp7JxqKxRprVzxUlVYIs9/2kG21v6DwrxvZ\n0JolnjnXAgMBAAECggEASC/O2/XGPpSL9OJp+y1UmvUfxU+fBRoHXK+VDItYqZga\n4wRCHfSGtGpvV8FF90wTDseCK2oTDO/GcwAFOHR3arBP3CNNCD2t8xHFPnvXqm8U\n3l6TVmNKKe9GCsuOdUeL6yQRihHZ9Dei7g4DRgBuenEfYKKA/woTddCW3Pc207Ry\n24ViO1RlnuHU9ZzS+meJAdBYvish2Q+z885Zn40moSrXNxIo3s4dckoxX3Vlzgnt\niLMsVwtQ12hEvVq8YmiJ2OQPwuudW4uM6F4smG1XCiWFZ6TY/RFh2C0MrYKenzXB\nCEf1iUaOsZoOLL35R9WnPiitDOYR7ArQx8TxIL8QcQKBgQD/iMNz1VrJ4e7uw5A9\nX/bW1QHmXGFZTNet5DGgUsm5L8NBTsBo6xCG5Ik5FxwSw5FP0joPy3GJJgDAS3Zf\nJ4M6OiP18io5QyG9uj+/CqM9ISc4x0atrx2nSvOSVyK7QBx5SMlTvcFoZjlgrUtZ\n/4Ku7DyClL8JF3pY9BiV75VJnQKBgQDoH/lM323aV7bdunMeW0UjvFAPEMNQnu8w\n9dvMtFYXfa75tywLjA4N7q66jFeDZ0Mvvcawtp0iEYWwl7etzRICG7uej7Op8Vty\nNJbyW9aN7L9OX5grJyogTdRZK2xgHVw8hKDBsef8pNc/Prh3/RGbg9jBaG32yNKA\n6k+qESvBAwKBgQCQ5dI+2pqSo4TC6y3dP49OnpZnM7cX1hTuy9jAGnG8irLjU26T\nj8ddVjXho5MNqMu7QXAfCLOmm2ANqjzDFDq7R8Cgc+MxeTmmxffjsnqB7Uy6S3Vu\ng0ADXuLi9noBSAddVsKis5T6SAz9Hwb9T3+hBOADA6mX1DJSQoe2bZZvmQKBgQCT\njE9xd8xiL8NDadLnBukJ8BeLnAIq6vvryTvwAOmAgRmKDc7ngB0m6gMS/UZbdnYU\nkLMNfOag0zaBq87LoUDDKlG2Vm3DpnGURK12XL4i9Mwdy1H0jC6Q3igOjjWTWtZY\neY2d0bI+u6E+yGWFj81zZvmO5wyPA9QasdX1qnh/dQKBgAdDo4C+Wuebo0ZSy9sa\n9ziwiOA7rfvAXnSs6MPQGWRUyrTPm7pv//kcnNweXDV1VJOQkMOk40LTrpu1s68l\nJH6j4deaE11pDCoVLyCsWzO1Fyp6FMEeyJ9gtORQRRecS66wuOukGH3V2icE0ib4\nuzHaHCoSdDVCqQkRrQOeLOyj\n-----END PRIVATE KEY-----';

    return await this.RSAService.getMsgSignature(JSON.stringify(msg), privateKey);
  }

  @Get('test-verify')
  async testVerify() {

    const msg: object = {name: 'Yurii'};
    const publicKey: string = '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA57PbiWYcl0r71IxPgrZM\nleAWZfN3WGfeyIs+Q9xBwsY0v6toeAvk7gjsiyD/FE/fCS9UhHQ7kWaHF/p8bsGi\ndMzaHa3qh358PEdrjcSMAJYLp0ZCUBND5VZWCUxSXBqYcfHdn2Zin9qTd7L7wymB\ntB2DGAVv1TV31h+0VyPH3dhPn5zaZJLkAl+b/QuD8YezXnVFxqmkOy/GmOJJxRWC\n3vbpeaQioS8idXrzSHXvOtmomDYtPWuS2igIMNValGc/6gVNbexvXm1lJJ1ugVs4\nDYgJSQ1Yf1jK5rpjwYp4MasqeycaisUaa1c8VJVWCLPf9pBttb+g8K8b2dCaJZ45\n1wIDAQAB\n-----END PUBLIC KEY-----';
    const signature: string = '6f5b111f39fe74445194a2da1e693f59675de70239c4ef8c6926249f9a1bed850f9d0b28493694d6a617289d7cda7321930f83aa3cc56250b814b340b67c0c36607f5e73eeb7fd2a94a3c9fdf99ac5e9ddadd74e1cb10b707b5f9e872d89d60b75f982d9bdd3de3fa7bfb0cd1d60e92e30b2515c9394194095bb1e467799ba032933d6d606782c2ec0d688c8f32cf7f7fc9232a928ce3ffa6b68322137a298317c29dd1870366169dd2ba9baca50cdb9b1ad84ab9514f48d5a1d32777ac22eab986334780064b02a7a6118f7ea01781db4d71bda4f583c4e4c6177e7a9b0adc3a4b2d03df3794f641aafe1ec451eb2dcef88c0e253c07bcfccf819c11e2bf08b';
    
    return await this.RSAService.verifyMsgSignature(JSON.stringify(msg), signature, publicKey);
  }
}
