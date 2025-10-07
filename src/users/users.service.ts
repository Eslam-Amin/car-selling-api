import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository, Like, ILike } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}
  async findOne(id: number): Promise<User>;
  async findOne(identifier: string): Promise<User>;
  async findOne(identifier: { email: string; username: string }): Promise<User>;

  async findOne(
    identifier: number | string | { email: string; username: string },
  ): Promise<User> {
    let user: User | null;
    if (typeof identifier === 'number')
      user = await this.repo.findOne({ where: { id: identifier } });
    else if (typeof identifier === 'object')
      user = await this.repo.findOne({
        where: [
          { username: ILike(identifier.username) },
          { email: ILike(identifier.email) },
        ],
      });
    else
      user = await this.repo.findOne({
        where: [{ username: ILike(identifier) }, { email: ILike(identifier) }],
      });

    if (!user) throw new NotFoundException('User not found');

    return user;
  }

  createOne(
    email: string,
    password: string,
    username: string,
    firstName: string,
    lastName: string,
    code?: string,
  ) {
    const user = this.repo.create({
      email,
      password,
      username,
      firstName,
      lastName,
      code,
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
