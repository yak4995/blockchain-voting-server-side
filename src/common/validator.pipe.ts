import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

/*
    ArgumentMetadata:
    -type: источник проверяемого значения: 'body' | 'query' | 'param' | 'custom'
    -metatype: тип значения: String, ...
    -data: строка, переданная в декораторе источника или undefined, если в декоратор был без аргументов
*/
@Injectable()
export class ValidatorPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }
    const object = plainToClass(metatype, value);
    const errors = await validate(object);
    if (errors.length > 0) {
      throw new BadRequestException('DTO validation error', '' + errors[0]);
    }
    return value;
  }

  private toValidate(metatype: any): boolean {
    const types = [String, Boolean, Number, Array, Object];
    return !types.find(type => metatype === type);
  }
}
