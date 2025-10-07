import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { DeepPartial, Repository } from 'typeorm';
import { User } from './user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let fakeUserRepository: DeepPartial<Repository<User>>;
  let globalUsers: User[] = [];
  beforeEach(async () => {
    fakeUserRepository = {
      findOne: (identifier: any) => {
        let user: Partial<User> | undefined = undefined;
        user = globalUsers.find((user) => user.id === identifier?.where?.id);
        return Promise.resolve(user as User);
      },
      find: ({
        skip,
        take,
        where: filter,
      }: {
        skip: number;
        take: number;
        where: any;
      }) => {
        if (!filter || Object.keys(filter).length === 0)
          return Promise.resolve(globalUsers);
        const cleaned = (value: string) => value?.replace(/^%|%$/g, '');
        // this is because the filter is an object with the property _value
        const filteredUsers = globalUsers.filter(
          (user) =>
            user.firstName === cleaned(filter[0]?.firstName?._value) ||
            user.lastName === cleaned(filter[0]?.lastName?._value),
        );
        return Promise.resolve(filteredUsers as User[]);
      },
      create: (input?: DeepPartial<User> | DeepPartial<User>[]) => {
        if (!input) {
          return {
            id: 1,
            email: 'default@test.com',
            username: 'default',
            firstName: 'Default',
            lastName: 'User',
          } as User;
        }

        if (Array.isArray(input)) {
          return input.map((user, idx) => ({
            id: idx + 1,
            email: user.email ?? `user${idx}@test.com`,
            username: user.username ?? `user${idx}`,
            firstName: user.firstName ?? 'Test',
            lastName: user.lastName ?? 'User',
          })) as User[];
        }
        return {
          id: Math.floor(100000 + Math.random() * 900000),
          email: input.email ?? 'user@test.com',
          password: input.password ?? 'password',
          username: input.username ?? 'user',
          firstName: input.firstName ?? 'Test',
          lastName: input.lastName ?? 'User',
        } as User;
      },
      save: (user: User) => {
        globalUsers.push(user);
        return Promise.resolve(user as User);
      },
      update: () => Promise.resolve({} as User),
      delete: () => Promise.resolve({} as User),
      remove: () => Promise.resolve([] as User[]),
      clear: () => Promise.resolve(void 0),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: fakeUserRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('can create a user', async () => {
    let user = await service.createOne(
      'test@test.com',
      'password',
      'test',
      'test',
      'test',
    );

    expect(user).toEqual({
      id: user.id,
      email: 'test@test.com',
      password: 'password',
      username: 'test',
      firstName: 'test',
      lastName: 'test',
    });
  });

  it('should find a user', async () => {
    const createdUser = await service.createOne(
      'test@test.com',
      'password',
      'test',
      'test',
      'test',
    );
    const user = await service.findOne(createdUser.id);
    expect(user).toEqual(createdUser);
  });

  it("can't find a user", async () => {
    await service.createOne(
      'test@test.com',
      'password',
      'test',
      'test',
      'test',
    );

    await expect(service.findOne(10)).rejects.toThrow(NotFoundException);
  });

  it('can find all users', async () => {
    await service.createOne(
      'test@test.com',
      'password',
      'test',
      'test',
      'test',
    );
    const users = await service.findAll(0, 10, '');
    expect(users.length).toBe(globalUsers.length);
    expect(users).toEqual(globalUsers);
  });

  it('can find a user by name', async () => {
    const createdUser = await service.createOne(
      'john@doe.com',
      'password',
      'johnDoe',
      'john',
      'doe',
    );
    const users = await service.findAll(0, 10, 'john');
    expect(users.length).toBe(1);
    expect(users).toEqual([createdUser]);
  });
});
