import { ApiModelProperty } from '@nestjs/swagger';

export class KeyPairDTO {
  @ApiModelProperty({
    description: 'публичный ключ',
  })
  readonly publicKey: string;
  @ApiModelProperty({
    description: 'привязанный к нему приватный ключ',
  })
  readonly privateKey: string;
}
