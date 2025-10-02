import { BadRequestException, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/user.entity';

@Injectable()
export class AuthService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  async signup(
    email: string,
    password: string,
    username: string,
    firstName: string,
    lastName: string,
  ) {
    const existingUser = await this.repo.findOne({
      where: [{ email }, { username }],
    });
    if (existingUser?.email === email)
      throw new BadRequestException('Email in use');
    else if (existingUser?.username === username)
      throw new BadRequestException('Username in use');
    const user = this.repo.create({
      email,
      password,
      username,
      firstName,
      lastName,
    });
    const savedUser = await this.repo.save(user);
    return { ...savedUser, password: undefined };
  }
}
