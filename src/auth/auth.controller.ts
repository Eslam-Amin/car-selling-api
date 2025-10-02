import { Controller, Post, Body } from '@nestjs/common';
import { CreateUserDto } from '../users/dtos/create-user.dto';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { Serialize } from 'src/interceptors/serialize.interceptor';
import { UserDto } from 'src/users/dtos/user.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signup')
  async createUser(@Body() body: CreateUserDto) {
    const user = await this.authService.signup(
      body.email,
      body.password,
      body.username,
      body.firstName,
      body.lastName,
    );
    return {
      message: 'User created successfully',
      data: user,
    };
  }

  @Post('/login')
  async login(@Body() body: LoginDto) {
    const user = await this.authService.login(body.email, body.password);
    return {
      message: 'User logged in successfully',
      data: user,
    };
  }
}
