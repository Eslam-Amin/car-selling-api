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
    // Create a fake copy of the users service
    fakeUsersService = {
      findOne: () => Promise.resolve({} as User),
      createOne: (
        email: string,
        password: string,
        username: string,
        firstName: string,
        lastName: string,
        code?: string,
      ) =>
        Promise.resolve({
          id: 1,
          email,
          password,
          username,
          firstName,
          lastName,
          code,
        }) as Promise<User>,
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
    fakeUsersService.findOne = () =>
      Promise.resolve({
        id: 1,
        email: 'test@test.com',
        password: 'password',
        username: 'testUsername',
        firstName: 'testFirstName',
        lastName: 'testLastName',
        verified: false,
        code: '123456',
      }) as Promise<User>;

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
    fakeUsersService.findOne = () =>
      Promise.resolve({
        id: 1,
        email: 'test@test.com',
        password: 'password',
        username: 'testUsername',
        firstName: 'testFirstName',
        lastName: 'testLastName',
        verified: false,
        code: '123456',
      }) as Promise<User>;

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
    fakeUsersService.findOne = jest.fn().mockResolvedValue(null);
    await expect(service.login('test@test.com', 'password')).rejects.toThrow(
      'Invalid credentials',
    );
  });

  it('throws an error if user logins with invalid credentials (password)', async () => {
    const user = await service.signup(
      'test@test.com',
      'password',
      'testUsername',
      'testFirstName',
      'testLastName',
    );

    fakeUsersService.findOne = jest.fn().mockResolvedValue({
      username: 'testUsername',
      email: 'test@test.com',
      verified: true,
      password: '$2b$10$a9wpKHT9NjbGylAKk7BcmOUvg3wRtMWy.P64HzUP3OqSGn0lFw8sW ',
    });

    await expect(service.login('test@test.com', 'password1')).rejects.toThrow(
      'Invalid credentials',
    );
  });

  it('throws an error if user logins and is not verified', async () => {
    fakeUsersService.findOne = jest.fn().mockResolvedValue({
      username: 'testUsername',
      email: 'test@test.com',
      verified: false,
      password: '$2b$10$a9wpKHT9NjbGylAKk7BcmOUvg3wRtMWy.P64HzUP3OqSGn0lFw8sW',
    });

    await expect(service.login('test@test.com', 'password')).rejects.toThrow(
      'User is not verified',
    );
  });

  it('logins an user', async () => {
    const user = {
      username: 'testUsername',
      email: 'test@test.com',
      verified: true,
      password: '$2b$10$a9wpKHT9NjbGylAKk7BcmOUvg3wRtMWy.P64HzUP3OqSGn0lFw8sW',
    };
    fakeUsersService.findOne = jest.fn().mockResolvedValue(user);

    const loggedInUser = await service.login('test@test.com', 'password');
    await expect(loggedInUser).toEqual(user);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
});
