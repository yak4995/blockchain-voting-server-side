import { ApiModelProperty } from '@nestjs/swagger';

export class KeyPairDTO {
  @ApiModelProperty()
  readonly publicKey: string;
  @ApiModelProperty()
  readonly privateKey: string;
}
