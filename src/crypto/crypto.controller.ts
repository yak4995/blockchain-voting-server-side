import { Controller, Get, UseGuards, Post, Body, UsePipes } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RSAService } from './rsa.service';
import { KeyPairDTO } from './dto/get-key-pair.dto';
import { SignPacketDTO } from './dto/sign-packet.dto';
import { VerifyPacketDTO } from './dto/verify-packet.dto';
import { ValidatorPipe } from '../common/validator.pipe';
import { MsgDTO } from './dto/message.dto';
import { SignObjectPacketDTO } from './dto/sign-object-packet.dto';
import { MsgObjDTO } from './dto/msg-object.dto';

@Controller('crypto')
export class CryptoController {
  constructor(private readonly rsaService: RSAService) {}

  // создаёт и сохраняет пару ключей, возвращая публичный ключ
  // (требует авторизации, потому что вызывается клиентом при создании выборов для генерирования ключа выборов)
  @Get('get-voting-pkey')
  @UseGuards(JwtAuthGuard)
  async getPublicKeyForVoting() {
    const keyPair: KeyPairDTO = await this.rsaService.generateKeyPair();
    await this.rsaService.saveKeyPair(keyPair);
    return keyPair.publicKey;
  }

  // endpoint-helper для получения пары ключей для избирателя (но без сохранения их в базе сервера)
  @Get('gen-keypair')
  async genKeyPair() {
    return await this.rsaService.generateKeyPair();
  }

  // endpoint-helper для получения SHA-256 хеша от произвольной строки
  @Post('get-hash')
  @UsePipes(ValidatorPipe)
  async getMsgHash(@Body() message: MsgDTO) {
    return await this.rsaService.getMsgHash(message.msg);
  }

  // endpoint-helper для получения SHA-256 хеша от произвольного объекта
  @Post('get-object-hash')
  @UsePipes(ValidatorPipe)
  async getObjHash(@Body() message: MsgObjDTO) {
    return await this.rsaService.getObjHash(message.msg);
  }

  // endpoint-helper для создания ЭЦП для произвольной строки
  @Post('sign')
  @UsePipes(ValidatorPipe)
  async sign(@Body() signPacket: SignPacketDTO) {
    return await this.rsaService.getMsgSignature(signPacket.message, signPacket.privateKey);
  }

  // endpoint-helper для создания ЭЦП для произвольного объекта
  @Post('sign-object')
  @UsePipes(ValidatorPipe)
  async signObject(@Body() signPacket: SignObjectPacketDTO) {
    return await this.rsaService.getObjSignature(signPacket.message, signPacket.privateKey);
  }

  // endpoint-helper для верификации ЭЦП
  @Post('verify')
  @UsePipes(ValidatorPipe)
  async verify(@Body() verifyPacket: VerifyPacketDTO) {
    return await this.rsaService.verifyMsgSignature(verifyPacket.message, verifyPacket.signature, verifyPacket.publicKey);
  }
}
