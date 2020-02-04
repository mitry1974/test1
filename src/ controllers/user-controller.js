import express from 'express';
import validatePassword from '../utils/authutils';
import { User } from '../db/models';

const router = express.Router();

const makeErrorResponse = (message) => ({
  ok: false,
  message,
  data: '',
});

const makeGoodResponse = (data) => ({
  ok: true,
  message: '',
  data,
});

router.post('/registration', async (req, res) => {
  try {
    const userData = req.body;
    if (!userData.password || userData.password === '') {
      res.status(422).send(makeErrorResponse('Password missed or blanc'));
      return;
    }

    if (!userData.email || userData.email === '') {
      res.status(422).send(makeErrorResponse('Email missed or blanc'));
      return;
    }

    if (!userData.username || userData.username === '') {
      res.status(422).send(makeErrorResponse('Username missed or blanc'));
      return;
    }

    const existingUser = await User.findOne(
      {
        where: { username: userData.username }
      });
    if (existingUser) {
      console.log(existingUser);
      res.status(422).send(makeErrorResponse('User with that username already registered'));
      return;
    }

    const user = await User.create(req.body);
    //    console.log(user);
    const authData = await user.authorize();

    res.status(201).send(makeGoodResponse(authData.token));
    return;
  } catch (err) {
    console.log('------------------error', err);
    return res.status(400).send(makeErrorResponse(err));
  }
});

router.post('/auth', async (req, res) => {
  const { username, password } = req.body;
  console.log('username = ', username, 'password = ', password);

  if (!username || !password) {
    return res.status(401).send(makeErrorResponse('Request missing username or password param'));
  }

  try {
    const user = await User.authenticate(username, password);
    console.log(user);
    const authToken = await user.authorize();

    return res.json(makeGoodResponse(authToken.token));
  } catch (err) {
    console.log(err);
    return res.status(401).send(makeErrorResponse('User unauthorized'));
  }
});

router.get('/user', (req, res) => {
  if (req.user) {
    return res.send(req.user);
  }
  res.status(404).send(
    { errors: [{ message: 'missing auth token' }] },
  );
});

router.post('/change_password', (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    console.log('error, null password');
    res.status(400).send(makeErrorResponse('Both passwords shouldn\'t be empty'));
  }

  if (oldPassword === newPassword) {
    console.log('error, old password and new password the same');
    res.status(400).send(makeErrorResponse('Passwords can\'t be the same'));
    return;
  }

  if (req.user) {
    console.log('user logged in');
    console.log('validate password = ', validatePassword);
    if (!validatePassword(req.user, oldPassword)) {
      console.log('error, password not validated');
      res.status(400).send(makeErrorResponse('Old password incorrect'));
      return;
    }

    console.log('password validated');
    req.user.update({ password: newPassword });
    console.log('password updated');
  } else {
    res.send.makeErrorResponse('User isn\'t autorized');
    return;
  }
  res.send(makeGoodResponse('Password changed'));
});

module.exports = router;
