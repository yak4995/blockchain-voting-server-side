import { IsString, IsArray, IsInt, Min, Max, ValidateIf, IsNotEmpty, ArrayNotEmpty } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

// DTO (data transfer object) - обьекты таких классов определяют формат данных, передаваемых по сетям
// Можно было б использовать интерфейсы, но Nest их теряет при трансформации в валидаторах
export class NodeDto {
  @ApiModelProperty()
  @ValidateIf(o => 2 !== o.type)
  @IsString()
  @IsNotEmpty()
  hash: string;

  @ApiModelProperty()
  @ValidateIf(o => o.type > 1)
  @IsString()
  @IsNotEmpty()
  readonly parentHash: string;

  @ApiModelProperty()
  @IsString()
  @IsNotEmpty()
  readonly authorPublicKey: string;

  @ApiModelProperty()
  @ValidateIf(o => 2 !== o.type)
  @IsString()
  @IsNotEmpty()
  signature: string;

  @ApiModelProperty()
  @IsInt()
  @Min(1)
  @Max(4)
  readonly type: number;

  @ApiModelProperty()
  @ValidateIf(o => [1, 3].includes(o.type))
  @IsString()
  @IsNotEmpty()
  readonly votingDescription: string;

  @ApiModelProperty()
  @ValidateIf(o => [1, 3].includes(o.type))
  @IsInt()
  @Min(0)
  readonly startTime: number;

  @ApiModelProperty()
  @ValidateIf(o => [1, 3].includes(o.type))
  @IsInt()
  @Min(0)
  readonly endTime: number;

  @ApiModelProperty()
  @ValidateIf(o => [1, 3].includes(o.type))
  @IsArray()
  @ArrayNotEmpty()
  readonly candidates: string[];

  @ApiModelProperty()
  @ValidateIf(o => [1, 3].includes(o.type))
  @IsArray()
  @ArrayNotEmpty()
  readonly admittedVoters: number[];

  @ApiModelProperty()
  @ValidateIf(o => 3 === o.type)
  @IsArray()
  @ArrayNotEmpty()
  readonly registeredVoters: number[];

  @ApiModelProperty()
  @ValidateIf(o => 1 === o.type)
  @IsString()
  @IsNotEmpty()
  readonly votingPublicKey: string;

  @ApiModelProperty()
  @ValidateIf(o => 2 === o.type)
  @IsString()
  @IsNotEmpty()
  readonly admittedUserPublicKey: string;

  @ApiModelProperty()
  @ValidateIf(o => 4 === o.type)
  @IsString()
  @IsNotEmpty()
  readonly selectedVariant: string;
}
