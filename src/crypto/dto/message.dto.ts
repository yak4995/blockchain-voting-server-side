import { IsString } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class MsgDTO {
  @ApiModelProperty({
    description: 'произвольная текстовая строка',
    required: true,
  })
  @IsString()
  readonly msg: string;
}
