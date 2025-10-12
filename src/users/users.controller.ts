import {
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Patch,
  Param,
  ParseIntPipe,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dtos/update-user.dto';
import { Serialize } from '../interceptors/serialize.interceptor';
import { UserDto } from './dtos/user.dto';
import { AuthGuard } from '../guards/auth.guard';
@Controller('users')
@Serialize(UserDto)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @UseGuards(AuthGuard)
  async getUsers(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('name') name?: string,
  ) {
    const skip = (page - 1) * limit;
    const { users, totalNumberOfUsers } = await this.usersService.findAll(
      skip,
      limit,
      name || '',
    );
    return {
      message: 'Users fetched successfully',
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalNumberOfUsers / limit),
        total: totalNumberOfUsers,
      },
      data: users,
    };
  }

  // @UseInterceptors(ClassSerializerInterceptor)
  @Get('/:id')
  async getUser(@Param('id') id: string) {
    const user = await this.usersService.findOne(parseInt(id));
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
