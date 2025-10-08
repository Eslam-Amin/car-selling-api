import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ILike, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    @InjectRepository(User) private repo: Repository<User>,
    private emailService: EmailService,
  ) {}

  async signup(
    email: string,
    password: string,
    username: string,
    firstName: string,
    lastName: string,
  ) {
    const existingUser = await this.usersService.findOne(
      { email, username },
      false,
    );
    if (existingUser?.email === email)
      throw new BadRequestException('Email in use');
    else if (existingUser?.username === username)
      throw new BadRequestException('Username in use');
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();
    await this.emailService.sendVerificationEmail(email, verificationCode);
    const hashedCode = await bcrypt.hash(verificationCode, 10);
    const user = await this.usersService.createOne(
      email,
      hashedPassword,
      username,
      firstName,
      lastName,
      hashedCode,
    );
    return {
      user,
      verificationCode,
    };
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findOne(email, false);
    if (!user) throw new NotFoundException('Invalid credentials');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new NotFoundException('Invalid credentials');

    if (!user.verified) throw new BadRequestException('User is not verified');

    return user;
  }

  async verify(email: string, code: string) {
    const user = await this.usersService.findOne(email, false);

    if (!user) throw new NotFoundException('Invalid credentials');
    const isCodeValid = await bcrypt.compare(
      code,
      user.verificationCode as string,
    );
    if (!isCodeValid) throw new BadRequestException('Invalid code');
    user.verified = true;
    user.verificationCode = null;
    return this.repo.save(user);
  }
}
