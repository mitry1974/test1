import express from 'express';
import { validatePassword } from '../utils/authutils';
import { User } from '../db/models';
import maskEmail from '../utils/emailutils';
import validateEmail from 'email-validator';
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
    console.log('=================================================', req.body);
    
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

    if(!validateEmail(userData.email)) {
      res.status(422).send(makeErrorResponse('Invalid email'));
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
  const username = req.query.username;

  if (!username) {
    res.status(400).send(makeErrorResponse('Username can\'t be empty'));
    return;
  }

  let userData = {};
  let user = null;
  let isForeignUser = true;

  if (req.user && username === req.user.username) {
    isForeignUser = false;
  }

  try {
    user = await User.findOne(
      {
        where: { username: username }
      }
    );
  } catch (err) {
    res.status(404).send(makeErrorResponse('User not found'));
    return;
  }

  if (!user) {
    res.status(404).send(makeErrorResponse('User not found'));
    return;
  }
  const email = isForeignUser ? maskEmail(user.email) : user.email;

    userData = {
      username: user.username,
      firstname: user.firstname,
      lastname: user.lastname,
      email
    };

  res.status(200).send(makeGoodResponse(userData));
});

module.exports = router;
