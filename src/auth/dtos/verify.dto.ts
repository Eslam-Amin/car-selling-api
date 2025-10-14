import { IsEmail, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class VerifyDto {
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @IsString()
  code: string;
}
