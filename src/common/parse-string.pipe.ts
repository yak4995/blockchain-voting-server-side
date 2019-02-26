import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { isString } from 'util';

@Injectable()
export class ParseStringPipe implements PipeTransform<string, string> {
  transform(value: string, metadata: ArgumentMetadata): string {
    if (!isString(value)) {
      throw new BadRequestException('Validation failed');
    }
    return value;
  }
}
