import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import * as bcrypt from 'bcryptjs';

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
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.repo.create({
      email,
      password: hashedPassword,
      username,
      firstName,
      lastName,
    });
    const savedUser = await this.repo.save(user);
    return { ...savedUser, password: undefined };
  }

  async login(email: string, password: string) {
    const user = await this.repo.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'username', 'firstName', 'lastName'],
    });
    if (!user) throw new NotFoundException('Invalid credentials');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new NotFoundException('Invalid credentials');

    return { ...user, password: undefined };
  }
}
