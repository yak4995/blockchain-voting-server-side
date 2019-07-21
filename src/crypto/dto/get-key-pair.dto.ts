import { ApiModelProperty } from '@nestjs/swagger';
import { IKeyPair } from '../interfaces/i-key-pair.interface';

export class KeyPairDTO implements IKeyPair {
  @ApiModelProperty({
    description: 'публичный ключ',
  })
  readonly publicKey: string;
  @ApiModelProperty({
    description: 'привязанный к нему приватный ключ',
  })
  readonly privateKey: string;
}
