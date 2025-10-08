import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { join } from 'path';

describe('Authentication Service (e2e)', () => {
  let app: INestApplication<App>;
  const email = 'test@test.com';
  const password = 'password';
  const username = 'test';
  const firstName = 'test';
  const lastName = 'test';
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('handles Signup request (Post)', () => {
    return request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email, password, username, firstName, lastName })
      .expect(201)
      .then((res) => {
        const { id, email, username, firstName, lastName } = res.body.data;
        expect(id).toBeDefined();
        expect(email).toBe(email);
        expect(username).toBe(username);
        expect(firstName).toBe(firstName);
        expect(lastName).toBe(lastName);
      });
  });

  it('handles Login request (Post)', async () => {
    const signupRes = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        email,
        password,
        username,
        firstName,
        lastName,
      })
      .expect(201);

    const { verificationCode } = signupRes.body;
    await request(app.getHttpServer())
      .post('/auth/verify')
      .send({ email, code: verificationCode })
      .expect(201);

    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password })
      .expect(201)
      .then((res) => {
        const { id, email, username, firstName, lastName } = res.body.data;
        expect(id).toBeDefined();
        expect(email).toBe(email);
        expect(username).toBe(username);
        expect(firstName).toBe(firstName);
        expect(lastName).toBe(lastName);
      });
  });

  it('handles Verify request (Post)', async () => {
    const signupRes = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email, password, username, firstName, lastName })
      .expect(201);

    const { verificationCode } = signupRes.body;
    return request(app.getHttpServer())
      .post('/auth/verify')
      .send({ email, code: verificationCode })
      .expect(201)
      .then((res) => {
        const { id, email, username, firstName, lastName } = res.body.data;
        expect(id).toBeDefined();
        expect(email).toBe(email);
        expect(username).toBe(username);
        expect(firstName).toBe(firstName);
        expect(lastName).toBe(lastName);
      });
  });

  it('handles signup then verify then Whoami request (Get)', async () => {
    const signupRes = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email, password, username, firstName, lastName })
      .expect(201);
    const { verificationCode } = signupRes.body;

    await request(app.getHttpServer())
      .post('/auth/verify')
      .send({ email, code: verificationCode })
      .expect(201);

    const cookie = signupRes.get('Set-Cookie') as string[];
    const { body } = await request(app.getHttpServer())
      .get('/auth/whoami')
      .set('Cookie', cookie)
      .expect(200);
    expect(body.data.email).toEqual(email);
    expect(body.data.username).toEqual(username);
    expect(body.data.firstName).toEqual(firstName);
    expect(body.data.lastName).toEqual(lastName);
  });

  afterEach(async () => {
    await app.close(); // Make sure to close the connection after each test
    // Then try to delete the file
    const fs = require('fs').promises;
    try {
      await fs.unlink(join(__dirname, '..', 'test.sqlite'));
    } catch (err) {
      console.error('Failed to delete database file:', err);
    }
    console.log('Database file deleted');
    console.log('App closed');
  });
});
