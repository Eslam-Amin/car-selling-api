import { Transform } from 'class-transformer';
import { IsEmail, IsString } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @IsString()
  password: string;

  @IsString()
  username: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;
}
