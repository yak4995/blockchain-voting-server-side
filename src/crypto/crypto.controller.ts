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
import { ApiBearerAuth, ApiUseTags, ApiResponse } from '@nestjs/swagger';

@ApiUseTags('BCVS')
@Controller('crypto')
export class CryptoController {
  constructor(private readonly rsaService: RSAService) {}

  // создаёт и сохраняет пару ключей, возвращая публичный ключ
  // (требует авторизации, потому что вызывается клиентом при создании выборов для генерирования ключа выборов)
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Created public key', type: 'string'})
  @Get('get-voting-pkey')
  @UseGuards(JwtAuthGuard)
  async getPublicKeyForVoting(): Promise<string> {
    const keyPair: KeyPairDTO = await this.rsaService.generateKeyPair();
    await this.rsaService.saveKeyPair(keyPair);
    return keyPair.publicKey;
  }

  // endpoint-helper для получения пары ключей для избирателя (но без сохранения их в базе сервера)
  @ApiResponse({ status: 200, description: 'Created keys pair', type: KeyPairDTO})
  @Get('gen-keypair')
  async genKeyPair(): Promise<KeyPairDTO> {
    return await this.rsaService.generateKeyPair();
  }

  // endpoint-helper для получения SHA-256 хеша от произвольной строки
  @ApiResponse({ status: 200, description: 'Hash', type: 'string'})
  @Post('get-hash')
  @UsePipes(ValidatorPipe)
  async getMsgHash(@Body() message: MsgDTO): Promise<string> {
    return await this.rsaService.getMsgHash(message.msg);
  }

  // endpoint-helper для получения SHA-256 хеша от произвольного объекта
  @ApiResponse({ status: 200, description: 'Hash', type: 'string'})
  @Post('get-object-hash')
  @UsePipes(ValidatorPipe)
  async getObjHash(@Body() message: MsgObjDTO): Promise<string> {
    return await this.rsaService.getObjHash(message.msg);
  }

  // endpoint-helper для создания ЭЦП для произвольной строки
  @ApiResponse({ status: 200, description: 'Signature', type: 'string'})
  @Post('sign')
  @UsePipes(ValidatorPipe)
  async sign(@Body() signPacket: SignPacketDTO): Promise<string> {
    return await this.rsaService.getMsgSignature(signPacket.message, signPacket.privateKey);
  }

  // endpoint-helper для создания ЭЦП для произвольного объекта
  @ApiResponse({ status: 200, description: 'Signature', type: 'string'})
  @Post('sign-object')
  @UsePipes(ValidatorPipe)
  async signObject(@Body() signPacket: SignObjectPacketDTO): Promise<string> {
    return await this.rsaService.getObjSignature(signPacket.message, signPacket.privateKey);
  }

  // endpoint-helper для верификации ЭЦП
  @ApiResponse({ status: 200, description: 'Validation result', type: 'string'})
  @Post('verify')
  @UsePipes(ValidatorPipe)
  async verify(@Body() verifyPacket: VerifyPacketDTO): Promise<boolean> {
    return await this.rsaService.verifyMsgSignature(verifyPacket.message, verifyPacket.signature, verifyPacket.publicKey);
  }
}
