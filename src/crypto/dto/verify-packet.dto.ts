import { IsString } from 'class-validator';

export class VerifyPacketDTO {
  @IsString()
  readonly message: string;

  @IsString()
  readonly signature: string;

  @IsString()
  readonly publicKey: string;
}
