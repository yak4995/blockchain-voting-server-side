import { IsNumber, IsString } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class JwtTokenDTO {
  @ApiModelProperty()
  @IsNumber()
  readonly expiresIn: number;

  @ApiModelProperty()
  @IsString()
  readonly accessToken: string;
}
