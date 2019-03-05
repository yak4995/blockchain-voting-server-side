import { IsString } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class AxiosAuthDTO {
  @ApiModelProperty()
  @IsString()
  readonly username: string;

  @ApiModelProperty()
  @IsString()
  readonly password: string;
}
