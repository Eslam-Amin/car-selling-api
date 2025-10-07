import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';
import { EmailService } from '../email/email.service';
import { Repository } from 'typeorm';

// jest.mock('bcryptjs', () => ({
//   hash: jest.fn(() => Promise.resolve('hashedPassword')),
//   compare: jest.fn(() => Promise.resolve(true)),
// }));

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    const users: Partial<User>[] = [];
    fakeUsersService = {
      findOne: (
        identifier: string | number | { email: string; username: string },
      ) => {
        let user: Partial<User> | undefined = undefined;
        if (typeof identifier === 'object') {
          user = users.find(
            (user) =>
              user.email === identifier.email ||
              user.username === identifier.username,
          );
        } else if (typeof identifier === 'string')
          user = users.find((user) => user.email === identifier);
        else user = users.find((user) => user.id === identifier);

        return Promise.resolve(user as User);
      },
      createOne: (
        email: string,
        password: string,
        username: string,
        firstName: string,
        lastName: string,
        code?: string,
      ) => {
        const user = {
          id: Math.floor(100000 + Math.random() * 900000),
          email,
          password,
          username,
          firstName,
          lastName,
          code: code || null,
          verified: false,
        };
        users.push(user);
        return Promise.resolve(user as User);
      },
    };

    const fakeUserRepository: Partial<Repository<User>> = {
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
    };

    const fakeEmailService = {
      sendVerificationEmail: jest.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
        {
          provide: getRepositoryToken(User),
          useValue: fakeUserRepository,
        },
        {
          provide: EmailService,
          useValue: fakeEmailService,
        },
      ],
    }).compile();
    service = module.get<AuthService>(AuthService);
  });

  it('can create an instance of auth service', () => {
    expect(service).toBeDefined();
  });

  it('creates a new user with a salted and hashed password', async () => {
    const user = await service.signup(
      'test@test.com',
      'password',
      'testUsername',
      'testFirstName',
      'testLastName',
    );
    expect(user.password).not.toEqual('password');
  });

  it('throws an error if user signs up with email that is in use', async () => {
    await service.signup(
      'test@test.com',
      'password',
      'testUsername',
      'testFirstName',
      'testLastName',
    );

    await expect(
      service.signup(
        'test@test.com',
        'password',
        'testUsername',
        'testFirstName',
        'testLastName',
      ),
    ).rejects.toThrow('Email in use');
  });

  it('throws an error if user signs up with username that is in use', async () => {
    await service.signup(
      'test@test.com',
      'password',
      'testUsername',
      'testFirstName',
      'testLastName',
    );

    await expect(
      service.signup(
        'test1@test.com',
        'password',
        'testUsername',
        'testFirstName',
        'testLastName',
      ),
    ).rejects.toThrow('Username in use');
  });

  it('throws an error if user logins with invalid credentials (email)', async () => {
    await service.signup(
      'test@test.com',
      'password',
      'testUsername',
      'testFirstName',
      'testLastName',
    );
    await expect(service.login('test1@test.com', 'password')).rejects.toThrow(
      'Invalid credentials',
    );
  });

  it('throws an error if user logins with invalid credentials (password)', async () => {
    await service.signup(
      'test@test.com',
      'password',
      'testUsername',
      'testFirstName',
      'testLastName',
    );

    await expect(service.login('test@test.com', 'password1')).rejects.toThrow(
      'Invalid credentials',
    );
  });

  it('throws an error if user logins and is not verified', async () => {
    await service.signup(
      'test@test.com',
      'password',
      'testUsername',
      'testFirstName',
      'testLastName',
    );
    await expect(service.login('test@test.com', 'password')).rejects.toThrow(
      'User is not verified',
    );
  });

  it('logins an user', async () => {
    const user = await service.signup(
      'test@test.com',
      'password',
      'testUsername',
      'testFirstName',
      'testLastName',
    );
    user.verified = true;
    const loggedInUser = await service.login('test@test.com', 'password');
    await expect(loggedInUser).toEqual(user);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
});
