// src/user/user-startup.service.ts
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { UsersService } from './users.service';

@Injectable()
export class UserStartupService implements OnApplicationBootstrap {
  constructor(private readonly userService: UsersService) {}

  async onApplicationBootstrap() {
    await this.userService.createDefaultAdminUser();
  }
}
