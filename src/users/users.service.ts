import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository, ILike } from 'typeorm';
import type { Cache } from 'cache-manager';
import * as bcrypt from 'bcryptjs';
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
          { username: identifier?.username },
          { email: identifier?.email },
        ],
      });
    else {
      const cachedUser = await this.cacheManager.get(cacheKey);
      if (cachedUser) return cachedUser as User;
      user = await this.repo.findOne({
        where: { email: identifier },
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
    verificationCode?: string | null,
    verificationCodeExpiresAt?: Date | null,
    isAdmin?: boolean,
    verified?: boolean,
  ) {
    const user = this.repo.create({
      email,
      password,
      username,
      firstName,
      lastName,
      verificationCode,
      verificationCodeExpiresAt,
      isAdmin,
      verified,
    });
    return this.repo.save(user);
  }

  async findAll(skip: number, limit: number, name: string) {
    let filter: any = { isAdmin: false };
    if (name)
      filter = [
        ...filter,
        { firstName: ILike(`%${name}%`) },
        { lastName: ILike(`%${name}%`) },
      ];
    const cacheKeyForUsers = `users-${JSON.stringify({ skip, limit, name })}`;
    const cacheKeyForTotalNumberOfUsers = `users-count-${name ?? ''}`;
    const cachedUsers = await this.cacheManager.get(cacheKeyForUsers);
    const cachedTotalNumberOfUsers = await this.cacheManager.get(
      cacheKeyForTotalNumberOfUsers,
    );
    if (cachedUsers && cachedTotalNumberOfUsers)
      return {
        users: JSON.parse(cachedUsers as string) as User[],
        totalNumberOfUsers: cachedTotalNumberOfUsers as number,
      };

    const [users, totalNumberOfUsers] = await Promise.all([
      this.repo.find({ skip, take: limit, where: filter }),
      this.repo.count({ where: filter }),
    ]);

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
    await this.cacheManager.del(`user-${id}`);
    await this.cacheManager.del(`user-${user.email}`);
    // return this.repo.update(id, attrs);
    Object.assign(user, attrs);
    return this.repo.save(user);
  }

  async deleteOne(id: number) {
    const user = await this.findOne(id);
    if (!user) throw new NotFoundException('User not found');
    await this.cacheManager.clear();

    return this.repo.remove(user);
  }

  async deleteAll() {
    await this.cacheManager.clear();
    return this.repo.clear();
  }

  async createDefaultAdminUser(): Promise<void> {
    const existingUser = await this.repo.findOne({
      where: { email: `${process.env.ADMIN_EMAIL}` },
    });

    if (!existingUser) {
      const hashedPassword = await bcrypt.hash(
        `${process.env.ADMIN_PASSWORD}`,
        10,
      );
      const user = this.createOne(
        `${process.env.ADMIN_EMAIL}`,
        hashedPassword,
        'iamsuperadmin',
        'Super',
        'Admin',
        null,
        null,
        true,
        true,
      );
      console.log('Default user created');
    } else {
      console.log('Default user already exists');
    }
  }
}
