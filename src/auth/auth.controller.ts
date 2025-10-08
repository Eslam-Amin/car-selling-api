import {
  Controller,
  Post,
  Body,
  Session,
  Get,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from '../users/dtos/create-user.dto';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { Serialize } from '../interceptors/serialize.interceptor';
import { UserDto } from '../users/dtos/user.dto';
import { VerifyDto } from './dtos/verify.dto';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { User } from '../users/user.entity';

@Controller('auth')
@Serialize(UserDto)
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signup')
  async createUser(@Body() body: CreateUserDto, @Session() session: any) {
    const { user, verificationCode } = await this.authService.signup(
      body.email,
      body.password,
      body.username,
      body.firstName,
      body.lastName,
    );
    session.userId = user.id;
    return {
      message: 'User created successfully',
      data: user,
      other: {
        verificationCode,
      },
    };
  }

  @Post('/login')
  async login(@Body() body: LoginDto, @Session() session: any) {
    const user = await this.authService.login(body.email, body.password);
    session.userId = user.id;
    return {
      message: 'User logged in successfully',
      data: user,
    };
  }

  @Post('/logout')
  async logout(@Session() session: any) {
    session.userId = null;
    return {
      message: 'User logged out successfully',
    };
  }

  @Post('/verify')
  async verify(@Body() body: VerifyDto) {
    const user = await this.authService.verify(body.email, body.code);
    return {
      message: 'User verified successfully',
      data: user,
    };
  }

  @Get('/whoami')
  async whoami(@CurrentUser() user: User) {
    if (!user) throw new UnauthorizedException('Unauthorized');
    return {
      message: 'User fetched successfully',
      data: user,
    };
  }
}
