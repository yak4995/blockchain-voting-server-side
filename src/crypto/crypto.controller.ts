import { 
    Controller, 
    Get, 
    UseGuards,
    Post,
    Body,
    Inject,
    UsePipes
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RSAService } from './rsa.service';
import { KeyPairDTO } from './dto/get-key-pair.dto';
import { SignPacketDTO } from './dto/sign-packet.dto';
import { VerifyPacketDTO } from './dto/verify-packet.dto';
import { AppLogger } from '../logger/app-logger.service';
import { ValidatorPipe } from '../common/validator.pipe';
import { MsgDTO } from './dto/message.dto';
import { SignObjectPacketDTO } from './dto/sign-object-packet.dto';
import { MsgObjDTO } from './dto/msg-object.dto';

@Controller('crypto')
export class CryptoController {

  constructor(
    private readonly RSAService: RSAService,
    @Inject('logger') private readonly loggerService: AppLogger
  ) {}

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
  async genKeyPair() {

    return await this.RSAService.generateKeyPair();
  }

  //endpoint-helper для получения SHA-256 хеша от произвольной строки
  @Post('get-hash')
  @UsePipes(ValidatorPipe)
  async getMsgHash(@Body() message: MsgDTO) {
    
    return await this.RSAService.getMsgHash(message.msg);
  }

  //endpoint-helper для получения SHA-256 хеша от произвольного объекта
  @Post('get-object-hash')
  @UsePipes(ValidatorPipe)
  async getObjHash(@Body() message: MsgObjDTO) {
    
    return await this.RSAService.getObjHash(message.msg);
  }

  //endpoint-helper для создания ЭЦП для произвольной строки
  @Post('sign')
  @UsePipes(ValidatorPipe)
  async sign(@Body() signPacket: SignPacketDTO) {

    return await this.RSAService.getMsgSignature(signPacket.message, signPacket.privateKey);
  }

  //endpoint-helper для создания ЭЦП для произвольного объекта
  @Post('sign-object')
  @UsePipes(ValidatorPipe)
  async signObject(@Body() signPacket: SignObjectPacketDTO) {

    return await this.RSAService.getObjSignature(signPacket.message, signPacket.privateKey);
  }

  //endpoint-helper для верификации ЭЦП
  @Post('verify')
  @UsePipes(ValidatorPipe)
  async verify(@Body() verifyPacket: VerifyPacketDTO) {

    return await this.RSAService.verifyMsgSignature(verifyPacket.message, verifyPacket.signature, verifyPacket.publicKey);
  }
}