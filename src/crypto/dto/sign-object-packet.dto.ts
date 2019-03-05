import { IsString } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class SignObjectPacketDTO {
  @ApiModelProperty()
  readonly message: object;

  @ApiModelProperty()
  @IsString()
  readonly privateKey: string;
}
