import { IsString } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class SignPacketDTO {
  @ApiModelProperty({
    description: 'произвольная строка',
    required: true,
  })
  @IsString()
  readonly message: string;

  @ApiModelProperty({
    description: 'приватный ключ для подписи',
    required: true,
  })
  @IsString()
  readonly privateKey: string;
}
