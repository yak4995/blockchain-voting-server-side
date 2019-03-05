import { IsString } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class VerifyPacketDTO {
  @ApiModelProperty()
  @IsString()
  readonly message: string;

  @ApiModelProperty()
  @IsString()
  readonly signature: string;

  @ApiModelProperty()
  @IsString()
  readonly publicKey: string;
}
