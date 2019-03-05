import { IsString } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class OuterServiceCredentialsDTO {
  @ApiModelProperty()
  @IsString()
  readonly name: string;

  @ApiModelProperty()
  @IsString()
  readonly key: string;
}
