import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository, Like, ILike } from 'typeorm';
import type { Cache } from 'cache-manager';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private repo: Repository<User>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}
  async findOne(id: number, throwError?: boolean): Promise<User | null>;
  async findOne(identifier: string, throwError?: boolean): Promise<User | null>;
  async findOne(
    identifier: { email: string; username: string },
    throwError?: boolean,
  ): Promise<User | null>;

  async findOne(
    identifier: number | string | { email: string; username: string },
    throwError: boolean = true,
  ): Promise<User | null> {
    let user: User | null;
    const cacheKey = `user-${identifier}`;
    if (typeof identifier === 'number') {
      const cachedUser = await this.cacheManager.get(cacheKey);
      if (cachedUser) return cachedUser as User;
      user = await this.repo.findOne({ where: { id: identifier } });
      await this.cacheManager.set(cacheKey, user);
    } else if (typeof identifier === 'object')
      user = await this.repo.findOne({
        where: [
          { username: ILike(identifier.username) },
          { email: ILike(identifier.email) },
        ],
      });
    else {
      const cachedUser = await this.cacheManager.get(cacheKey);
      if (cachedUser) return cachedUser as User;
      user = await this.repo.findOne({
        where: { email: ILike(identifier) },
      });
    }

    if (!user && throwError) throw new NotFoundException('User not found');

    return user ?? null;
  }

  createOne(
    email: string,
    password: string,
    username: string,
    firstName: string,
    lastName: string,
    verificationCode?: string,
    verificationCodeExpiresAt?: Date,
  ) {
    const user = this.repo.create({
      email,
      password,
      username,
      firstName,
      lastName,
      verificationCode,
      verificationCodeExpiresAt,
    });
    return this.repo.save(user);
  }

  async findAll(skip: number, limit: number, name: string) {
    let filter: any = {};
    if (name)
      filter = [
        { firstName: Like(`%${name}%`) },
        { lastName: Like(`%${name}%`) },
      ];
    const cacheKeyForUsers = `users_${JSON.stringify({ skip, limit, name })}`;
    const cacheKeyForTotalNumberOfUsers = `users_count_${name ?? ''}`;
    const cachedUsers = await this.cacheManager.get(cacheKeyForUsers);
    const cachedTotalNumberOfUsers = await this.cacheManager.get(
      cacheKeyForTotalNumberOfUsers,
    );
    if (cachedUsers && cachedTotalNumberOfUsers)
      return {
        users: JSON.parse(cachedUsers as string) as User[],
        totalNumberOfUsers: cachedTotalNumberOfUsers as number,
      };

    const users = await this.repo.find({
      skip,
      take: limit,
      where: filter,
    });
    const totalNumberOfUsers = await this.repo.count({ where: filter });
    await this.cacheManager.set(cacheKeyForUsers, JSON.stringify(users));
    await this.cacheManager.set(
      cacheKeyForTotalNumberOfUsers,
      totalNumberOfUsers,
    );
    return {
      users,
      totalNumberOfUsers,
    };
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
    await this.cacheManager.del(`user-${id}`);
    await this.cacheManager.del(`user-${user.email}`);

    return this.repo.remove(user);
  }

  async deleteAll() {
    await this.cacheManager.clear();
    return this.repo.clear();
  }
}
