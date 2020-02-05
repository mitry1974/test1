import express from 'express';
import { validatePassword } from '../utils/authutils';
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
      res.status(422).send(makeErrorResponse('User with that username already registered'));
      return;
    }

    const user = await User.create(req.body);
    const authData = await user.authorize();

    res.status(201).send(makeGoodResponse(authData.token));
    return;
  } catch (err) {
    return res.status(400).send(makeErrorResponse(err));
  }
});

router.post('/auth', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(401).send(makeErrorResponse('Request missing username or password param'));
  }

  try {
    const user = await User.authenticate(username, password);
    const authToken = await user.authorize();

    return res.json(makeGoodResponse(authToken.token));
  } catch (err) {
    return res.status(401).send(makeErrorResponse('User unauthorized'));
  }
});

router.post('/change_password', async (req, res) => {
  if (!req.user) {
    res.status(400).send(makeErrorResponse('User should be autorized'));
    return;
  }

  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    res.status(400).send(makeErrorResponse('Both passwords shouldn\'t be empty'));
    return;
  }

  if (oldPassword === newPassword) {
    res.status(400).send(makeErrorResponse('Passwords can\'t be the same'));
    return;
  }

  if (!validatePassword(req.user, oldPassword)) {
    res.status(400).send(makeErrorResponse('Old password incorrect'));
    return;
  }

  await req.user.update({ password: newPassword });
  res.send(makeGoodResponse('Password changed'));
  return;
});

router.get('/user', async (req, res) => {
  const username = req.body.username;
  let userData = {};
  let user = null;
  const isForeignUser = false;
  
  if (req.user && username === req.username) {
    user = req.user;
    isForeignUser = true;
  } else {
    user = await User.findOne(
      {
        where: { username: userData.username }
      });
  }

  if(!user) {
    res.status(404).send(makeErrorResponse('User not found'));
    return;
  }

  userData = {
    login: user.login,
    firstname: user.firstname,
    lastname: user.lastname,
    email: user.email
  };

  res.status(200).send(makeGoodResponse(userData));
});

module.exports = router;
