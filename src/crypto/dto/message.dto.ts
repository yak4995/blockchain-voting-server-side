import { IsString } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class MsgDTO {
  @ApiModelProperty()
  @IsString()
  readonly msg: string;
}
