import { IsString } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class VerifyPacketDTO {
  @ApiModelProperty({
    description: 'произвольная строка',
    required: true,
  })
  @IsString()
  readonly message: string;

  @ApiModelProperty({
    description: 'подписанная приватным ключом строка',
    required: true,
  })
  @IsString()
  readonly signature: string;

  @ApiModelProperty({
    description: 'публичный ключ, соответствующий приватному ключу',
    required: true,
  })
  @IsString()
  readonly publicKey: string;
}
