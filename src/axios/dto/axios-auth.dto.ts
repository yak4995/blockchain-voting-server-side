import { IsString } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class AxiosAuthDTO {
  @ApiModelProperty({
    description: 'логин пользователя на клиенте',
    required: true,
  })
  @IsString()
  readonly username: string;

  @ApiModelProperty({
    description: 'пароль пользователя на клиенте',
    required: true,
  })
  @IsString()
  readonly password: string;
}
