import { IsString } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class SignObjectPacketDTO {
  @ApiModelProperty({
    description: 'произвольный JSON-объект',
    required: true,
  })
  readonly message: object;

  @ApiModelProperty({
    description: 'приватный ключ для ЭЦП',
    required: true,
  })
  @IsString()
  readonly privateKey: string;
}
