import { IsString } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class OuterServiceCredentialsDTO {
  @ApiModelProperty({
    description: 'логин пользователя на клиенте',
    required: true,
  })
  @IsString()
  readonly name: string;

  @ApiModelProperty({
    description: 'пароль пользователя на клиенте',
    required: true,
  })
  @IsString()
  readonly key: string;
}
