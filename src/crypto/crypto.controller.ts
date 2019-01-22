import { 
    Controller, 
    Get, 
    UseGuards,
    Post,
    Body,
    Inject
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RSAService } from './rsa.service';
import { KeyPairDTO } from './dto/get-key-pair.dto';
import { SignPacketDTO } from './dto/sign-packet.dto';
import { VerifyPacketDTO } from './dto/verify-packet.dto';
import { AppLogger } from '../logger/app-logger.service';

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

  //endpoint-helper для создания ЭЦП для сообщения
  @Post('sign')
  async sign(@Body() signPacket: SignPacketDTO) {

    //TODO: валидация
    return await this.RSAService.getMsgSignature(signPacket.message, signPacket.privateKey);
  }

  //endpoint-helper для верификации ЭЦП
  @Post('verify')
  async verify(@Body() verifyPacket: VerifyPacketDTO) {

    //TODO: валидация
    return await this.RSAService.verifyMsgSignature(verifyPacket.message, verifyPacket.signature, verifyPacket.publicKey);
  }
}