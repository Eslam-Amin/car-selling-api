import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ILike, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import * as bcrypt from 'bcryptjs';
import { UsersService } from 'src/users/users.service';
import { EmailService } from 'src/email/email.service';

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
    const existingUser = await this.repo.findOne({
      where: [{ email: ILike(email) }, { username: ILike(username) }],
    });
    if (existingUser?.email === email)
      throw new BadRequestException('Email in use');
    else if (existingUser?.username === username)
      throw new BadRequestException('Username in use');
    const hashedPassword = await bcrypt.hash(password, 10);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await this.emailService.sendVerificationEmail(email, code);
    const hashedCode = await bcrypt.hash(code, 10);
    return this.usersService.createOne(
      email,
      hashedPassword,
      username,
      firstName,
      lastName,
      hashedCode,
    );
  }

  async login(email: string, password: string) {
    const user = await this.repo.findOne({
      where: { email },
    });
    if (!user) throw new NotFoundException('Invalid credentials');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new NotFoundException('Invalid credentials');

    if (!user.verified) throw new BadRequestException('User not verified');

    return user;
  }

  async verify(email: string, code: string) {
    const user = await this.repo.findOne({
      where: { email },
    });
    if (!user) throw new NotFoundException('Invalid credentials');
    const isCodeValid = await bcrypt.compare(code, user.code as string);
    if (!isCodeValid) throw new BadRequestException('Invalid code');
    user.verified = true;
    user.code = null;
    return this.repo.save(user);
  }
}
