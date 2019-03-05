import { ApiModelProperty } from '@nestjs/swagger';

export class MsgObjDTO {
  @ApiModelProperty()
  readonly msg: object;
}
