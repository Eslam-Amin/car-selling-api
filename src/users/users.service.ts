import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository, Like } from 'typeorm';
import { CreateUserDto } from './dtos/create-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  createOne(
    email: string,
    password: string,
    username: string,
    firstName: string,
    lastName: string,
  ) {
    const user = this.repo.create({
      email,
      password,
      username,
      firstName,
      lastName,
    });
    return this.repo.save(user);
  }

  findAll(skip: number, limit: number, name: string) {
    let filter: any = {};
    if (name)
      filter = [
        { firstName: Like(`%${name}%`) },
        { lastName: Like(`%${name}%`) },
      ];

    return this.repo.find({
      skip,
      take: limit,
      where: filter,
    });
  }

  async findOne(id: number) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateOne(id: number, attrs: Partial<User>) {
    const user = await this.findOne(id);
    if (!user) throw new NotFoundException('User not found');

    // return this.repo.update(id, attrs);
    Object.assign(user, attrs);
    return this.repo.save(user);
  }

  async deleteOne(id: number) {
    const user = await this.findOne(id);
    if (!user) throw new NotFoundException('User not found');

    return this.repo.remove(user);
  }

  async deleteAll() {
    return this.repo.clear();
  }
}
