import { IsString } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class SignPacketDTO {
  @ApiModelProperty()
  @IsString()
  readonly message: string;

  @ApiModelProperty()
  @IsString()
  readonly privateKey: string;
}
