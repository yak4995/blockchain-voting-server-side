import { ApiModelProperty } from '@nestjs/swagger';

export class MsgObjDTO {
  @ApiModelProperty({
    description: 'произвольный JSON-объект',
    required: true,
  })
  readonly msg: object;
}
