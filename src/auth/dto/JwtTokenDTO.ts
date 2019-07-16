import { IsNumber, IsString } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class JwtTokenDTO {
  @ApiModelProperty({
    description: 'время, когда токен истечёт',
  })
  @IsNumber()
  readonly expiresIn: number;

  @ApiModelProperty({
    description: 'токен доступа',
  })
  @IsString()
  readonly accessToken: string;
}
