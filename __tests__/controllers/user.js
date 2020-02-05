import request from 'supertest';
import express, { response } from 'express';
import init from '../../src/app';
import maskEmail from '../../src/utils/emailutils';

const objectClone = (object) => JSON.parse(JSON.stringify(object));

let app = null;

const user1RegData = {
  firstname: "firstname1",
  lastname: "lastname1",
  email: "user1@testfakeemail.com",
  username: "user1",
  password: "password",
};

const user2RegData = {
  firstname: "firstname2",
  lastname: "lastname2",
  email: "user2@testfakeemail.com",
  username: "user2",
  password: "password",
};

const user3RegData = {
  firstname: "firstname3",
  lastname: "lastname3",
  email: "user3@testfakeemail.com",
  username: "user3",
  password: "password",
};

const user1authData = {
  username: "user1",
  password: "password",
};

describe('Testing /registration', () => {
  beforeAll(async () => {
    app = express();
    await init(app);
  });

  it('Test /registration with good data', async () => {
    const userData = objectClone(user1RegData);
    const response = await request(app)
      .post('/registration')
      .send(userData);
    console.log(response.body);
    expect(response.statusCode).toBe(201); // created
  });

  it('Test /registration without password', async () => {
    const userData = objectClone(user1RegData);
    userData.password = '';
    const response = await request(app)
      .post('/registration')
      .send(userData);
    expect(response.statusCode).toBe(422);
    expect(response.body.message).toBe('Password missed or blanc');
  });

  it('Test /registration without email', async () => {
    const userData = objectClone(user1RegData);
    userData.email = '';
    const response = await request(app)
      .post('/registration')
      .send(userData);
    expect(response.statusCode).toBe(422);
    expect(response.body.message).toBe('Email missed or blanc');
  });

  it('Test /registration invalid email', async () => {
    const userData = objectClone(user1RegData);
    userData.email = 'fjkhfdhsfhfd';
    const response = await request(app)
      .post('/registration')
      .send(userData);
    expect(response.statusCode).toBe(422);
    expect(response.body.message).toBe('Invalid email');
  });

  it('Test /registration without username', async () => {
    const userData = objectClone(user1RegData);
    userData.username = '';
    const response = await request(app)
      .post('/registration')
      .send(userData);
    expect(response.statusCode).toBe(422);
    expect(response.body.message).toBe('Username missed or blanc');
  });

  it('Test /registration duplicate username', async () => {
    const response = await request(app)
      .post('/registration')
      .send(user2RegData);
    expect(response.body.message).toBe('');
    expect(response.statusCode).toBe(201);

    const wrongResponse = await request(app)
      .post('/registration')
      .send(user2RegData);
    expect(wrongResponse.statusCode).toBe(422);
    expect(wrongResponse.body.message).toBe('User with that username already registered');
  });

  afterAll(() => {
    app.close();
    app = null;
  });
});

describe('Testing /change_password', () => {
  let token = null;

  beforeAll(async () => {
    app = express();
    await init(app);
    const userData = objectClone(user1RegData);
    await request(app)
      .post('/registration')
      .send(userData);

    const response = await request(app)
      .post('/auth')
      .send(user1authData);
    expect(response.statusCode).toBe(200);
    expect(response.body.token !== '');
    token = response.body.data;
  });

  it('Test /change_password with logged in user and good data', async () => {
    const chPasswordResponse = await request(app)
      .post('/change_password')
      .set('authorization', 'Bearer ' + token)
      .send({
        oldPassword: 'password',
        newPassword: 'new_password',
      });
    expect(chPasswordResponse.statusCode).toBe(200);
    expect(chPasswordResponse.body.data).toBe('Password changed');
  });

  it('Test /change_password wrong old password', async () => {
    const chPasswordResponse = await request(app)
      .post('/change_password')
      .set('authorization', 'Bearer ' + token)
      .send({
        oldPassword: 'kjkkjkj',
        newPassword: 'new_password',
      });
    expect(chPasswordResponse.statusCode).toBe(400);
    expect(chPasswordResponse.body.message).toBe('Old password incorrect');
  });

  it('Test /change_password missed token', async () => {
    const chPasswordResponse = await request(app)
      .post('/change_password')
      .send({
        oldPassword: 'password',
        newPassword: 'new_password',
      });
    expect(chPasswordResponse.statusCode).toBe(400);
    expect(chPasswordResponse.body.message).toBe('User should be autorized');
  });

  it('Test /change_password missed new password', async () => {
    const chPasswordResponse = await request(app)
      .post('/change_password')
      .set('authorization', 'Bearer ' + token)
      .send({
        oldPassword: 'password',
        newPassword: '',
      });
    expect(chPasswordResponse.statusCode).toBe(400);
    expect(chPasswordResponse.body.message).toBe('Both passwords shouldn\'t be empty');
  });

  it('Test /change_password with new password the same as old password', async () => {
    const chPasswordResponse = await request(app)
      .post('/change_password')
      .set('authorization', 'Bearer ' + token)
      .send({
        oldPassword: 'password',
        newPassword: 'password',
      });
    expect(chPasswordResponse.statusCode).toBe(400);
    expect(chPasswordResponse.body.message).toBe('Passwords can\'t be the same');
  });

  afterAll(() => {
    app.close();
    app = null;
  });
});

describe('Testing /auth', () => {
  beforeAll(async () => {
    app = express();
    await init(app);
    const userData = objectClone(user1RegData);
    const regResponse = await request(app)
      .post('/registration')
      .send(userData);
  });

  it('Test /auth with good data', async () => {
    const authResponse = await request(app)
      .post('/auth')
      .send(user1authData);
    expect(authResponse.statusCode).toBe(200);
    expect(authResponse.body.data != '');
  });

  it('Test /auth with unexisting user', async () => {
    const authResponse = await request(app)
      .post('/auth')
      .send({
        username: "user122",
        password: "password"
      });
    expect(authResponse.statusCode).toBe(401);
    expect(authResponse.body.message === 'User unauthorized');
  });

  it('Test /auth with missing credentials', async () => {
    const authResponse = await request(app)
      .post('/auth')
      .send({});
    expect(authResponse.statusCode).toBe(401);
    expect(authResponse.body.message === 'Request missing username or password param');
  });

  afterAll(() => {
    app.close();
    app = null;
  });
});

describe('Testing /user', () => {
  let token = null;

  beforeAll(async () => {
    app = express();
    await init(app);

    try {
      let userData = objectClone(user1RegData);
      await request(app)
        .post('/registration')
        .send(userData);

      const response = await request(app)
        .post('/auth')
        .send(user1authData);
      expect(response.statusCode).toBe(200);
      expect(response.body.token !== '');
      token = response.body.data;

      userData = objectClone(user2RegData);
      await request(app)
        .post('/registration')
        .send(userData);

    } catch (err) {
      console.log('test initialization error', err);
    }
  });

  it('Test /user logged in with proper username', async () => {
    const response = await request(app)
      .get('/user')
      .query({
        username: user1RegData.username
      })
      .set('authorization', 'Bearer ' + token);
    expect(response.statusCode).toBe(200);
    expect(response.body.data.username).toBe(user1RegData.username);
    expect(response.body.data.email).toBe(user1RegData.email);
    expect(response.body.data.firstname).toBe(user1RegData.firstname);
    expect(response.body.data.lastname).toBe(user1RegData.lastname);
  });

  it('Test /user logged in without username', async () => {
    const response = await request(app)
      .get('/user')
      .query({
        username: ''
      })
      .set('authorization', 'Bearer ' + token);
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Username can\'t be empty');
  });

  it('Test /user logged in with wrong username', async () => {
    const response = await request(app)
      .get('/user')
      .query({
        username: 'wrongusername'
      })
      .set('authorization', 'Bearer ' + token);
    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBe('User not found');
  });

  it('Test /user with proper username', async () => {
    const response = await request(app)
      .get('/user')
      .query({
        username: user2RegData.username
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.data.username).toBe(user2RegData.username);
    expect(response.body.data.firstname).toBe(user2RegData.firstname);
    expect(response.body.data.lastname).toBe(user2RegData.lastname);
    expect(response.body.data.email).toBe(maskEmail(user2RegData.email));
  });

  afterAll(() => {
    app.close();
    app = null;
  });
});