import request from 'supertest';
import express, { response } from 'express';
import init from '../../src/app';

const objectClone = (object) => JSON.parse(JSON.stringify(object));

let app = null;

const user1RegData = {
    firstname: "firstname1",
    secondname: "secondname1",
    email: "user1@testfakeemail.com",
    username: "user1",
    password: "password",
};

const user2RegData = {
    firstname: "firstname2",
    secondname: "secondname2",
    email: "user2@testfakeemail.com",
    username: "user2",
    password: "password",
};

const user3RegData = {
    firstname: "firstname3",
    secondname: "secondname3",
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
            expect(chPasswordResponse.body.message).toBe('Password changed');
    });

    afterAll(() => {
        app.close();
        app = null;
    });
});

describe('Testing /user', () => {
    beforeAll(async () => {
        app = express();
        await init(app);
        const userData = objectClone(user1RegData);
        const regResponse = await request(app)
            .post('/registration')
            .send(userData);
    });

    afterAll(() => {
        app.close();
        app = null;
    });
});