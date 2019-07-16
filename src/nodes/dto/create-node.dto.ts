import { IsString, IsArray, IsInt, Min, Max, ValidateIf, IsNotEmpty, ArrayNotEmpty } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';
import { NodeType } from 'nodes/enums/nodeType.enum';

// DTO (data transfer object) - обьекты таких классов определяют формат данных, передаваемых по сетям
// Можно было б использовать интерфейсы, но Nest их теряет при трансформации в валидаторах
export class NodeDto {
  @ApiModelProperty({
    description: 'хеш узла',
  })
  @ValidateIf(o => NodeType.REGISTER_VOTER !== o.type)
  @IsString()
  @IsNotEmpty()
  hash: string;

  @ApiModelProperty({
    description: 'хеш родительского узла или пустая строка',
  })
  @ValidateIf(o => NodeType.VOTING_CHAIN_HEAD < o.type)
  @IsString()
  @IsNotEmpty()
  readonly parentHash: string;

  @ApiModelProperty({
    description: 'публичный ключ автора сообщения',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  readonly authorPublicKey: string;

  @ApiModelProperty({
    description: 'подпись узла',
  })
  @ValidateIf(o => NodeType.REGISTER_VOTER !== o.type)
  @IsString()
  @IsNotEmpty()
  signature: string;

  @ApiModelProperty({
    description: 'хеш узла',
    required: true,
    enum: NodeType,
  })
  @IsInt()
  @Min(1)
  @Max(4)
  readonly type: NodeType;

  @ApiModelProperty({
    description: 'описание выборов',
  })
  @ValidateIf(o => [NodeType.VOTING_CHAIN_HEAD, NodeType.START_VOTING].includes(o.type))
  @IsString()
  @IsNotEmpty()
  readonly votingDescription: string;

  @ApiModelProperty({
    description: 'отметка времени начала',
  })
  @ValidateIf(o => [NodeType.VOTING_CHAIN_HEAD, NodeType.START_VOTING].includes(o.type))
  @IsInt()
  @Min(0)
  readonly startTime: number;

  @ApiModelProperty({
    description: 'отметка времени конца',
  })
  @ValidateIf(o => [NodeType.VOTING_CHAIN_HEAD, NodeType.START_VOTING].includes(o.type))
  @IsInt()
  @Min(0)
  readonly endTime: number;

  @ApiModelProperty({
    description: 'массив кандидатов',
    isArray: true,
    type: 'string',
  })
  @ValidateIf(o => [NodeType.VOTING_CHAIN_HEAD, NodeType.START_VOTING].includes(o.type))
  @IsArray()
  @ArrayNotEmpty()
  readonly candidates: string[];

  @ApiModelProperty({
    description: 'массив ид допущенных избирателей',
    isArray: true,
    type: 'number',
  })
  @ValidateIf(o => [NodeType.VOTING_CHAIN_HEAD, NodeType.START_VOTING].includes(o.type))
  @IsArray()
  @ArrayNotEmpty()
  readonly admittedVoters: number[];

  @ApiModelProperty({
    description: 'массив ид зарегистрированных избирателей',
    isArray: true,
    type: 'number',
  })
  @ValidateIf(o => NodeType.START_VOTING === o.type)
  @IsArray()
  @ArrayNotEmpty()
  readonly registeredVoters: number[];

  @ApiModelProperty({
    description: 'публичный ключ выборов',
  })
  @ValidateIf(o => NodeType.VOTING_CHAIN_HEAD === o.type)
  @IsString()
  @IsNotEmpty()
  readonly votingPublicKey: string;

  @ApiModelProperty({
    description: 'публичный ключ допущенного избирателя',
  })
  @ValidateIf(o => NodeType.REGISTER_VOTER === o.type)
  @IsString()
  @IsNotEmpty()
  readonly admittedUserPublicKey: string;

  @ApiModelProperty({
    description: 'избранный кандидат',
  })
  @ValidateIf(o => NodeType.VOTE === o.type)
  @IsString()
  @IsNotEmpty()
  readonly selectedVariant: string;
}
