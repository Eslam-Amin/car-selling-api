import { Controller, Delete, Get, Patch, Param, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dtos/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  async getUsers() {
    const users = await this.usersService.findAll();
    return {
      message: 'Users fetched successfully',
      data: users,
    };
  }

  // @UseInterceptors(ClassSerializerInterceptor)
  @Get('/:id')
  async getUser(@Param('id') id: string) {
    const user = await this.usersService.findOne(parseInt(id));
    // return user;
    return {
      message: 'User fetched successfully',
      data: user,
    };
  }

  @Patch('/:id')
  async updateUser(@Param('id') id: string, @Body() body: UpdateUserDto) {
    const user = await this.usersService.updateOne(parseInt(id), body);
    return {
      message: 'User updated successfully',
      data: user,
    };
  }

  @Delete('/:id')
  deleteUser(@Param('id') id: string) {
    this.usersService.deleteOne(parseInt(id));
    return {
      message: 'User deleted successfully',
      data: {},
    };
  }

  @Delete()
  deleteAllUsers() {
    this.usersService.deleteAll();
    return {
      message: 'All users deleted successfully',
      data: {},
    };
  }
}
