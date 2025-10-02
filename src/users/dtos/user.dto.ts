import { Expose } from 'class-transformer';

export class UserDto {
  @Expose()
  id: number;
  @Expose()
  email: string;
  @Expose()
  username: string;
  @Expose()
  firstName: string;
  @Expose()
  lastName: string;
  @Expose()
  fullName: string;
}
