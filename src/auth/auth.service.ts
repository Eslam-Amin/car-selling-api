import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ILike, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    @InjectRepository(User) private repo: Repository<User>,
    private emailService: EmailService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
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

    const user = await this.usersService.createOne(
      email,
      hashedPassword,
      username,
      firstName,
      lastName,
    );
    const { verificationCode } = await this.sendVerificationCode(email, user);
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

    if (!user) throw new NotFoundException('Invalid Email Address');
    if (user.verified)
      throw new BadRequestException('User is already Verified');
    const isCodeValid = await bcrypt.compare(
      code,
      user.verificationCode as string,
    );
    if (!isCodeValid)
      throw new BadRequestException('Invalid Verification C ode');
    if (
      user.verificationCodeExpiresAt &&
      user?.verificationCodeExpiresAt < new Date()
    )
      throw new BadRequestException('Verification Code Expired');
    user.verified = true;
    user.verificationCode = null;
    user.verificationCodeExpiresAt = null;
    await this.cacheManager.del(`user-${user.id}`);
    await this.cacheManager.del(`user-${user.email}`);
    return this.repo.save(user);
  }

  async sendVerificationCode(
    email: string,
    createdUser?: User,
  ): Promise<{ user: User; verificationCode: string }> {
    let user: User;
    if (createdUser) user = createdUser;
    else {
      user = (await this.usersService.findOne(email, false)) as User;
      if (!user) throw new NotFoundException('User not found');
      else if (user.verified)
        throw new BadRequestException('User already verified');
    }

    const verificationCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();
    await this.emailService.sendVerificationEmail(email, verificationCode);

    const hashedCode = await bcrypt.hash(verificationCode, 10);
    user.verificationCode = hashedCode;
    user.verificationCodeExpiresAt = new Date(Date.now() + 1000 * 60 * 10);

    const savedUser = await this.repo.save(user);

    return { user: savedUser, verificationCode };
  }
}
