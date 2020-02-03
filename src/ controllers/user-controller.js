import express from 'express';
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
    const user = await User.create(req.body);
    const authData = await user.authorize();

    return res.json({
      ok: true,
      message: '',
      data: authData.token,
    });
  } catch (err) {
    console.log(err);
    return res.status(400).send(makeErrorResponse(err.errors[0].message));
  }
});

router.post('/auth', async (req, res) => {
  const { username, password } = req.body;
  console.log('username = ', username, 'password = ', password);

  if (!username || !password) {
    return res.status(400).send(makeErrorResponse('Request missing username or password param'));
  }

  try {
    const user = await User.authenticate(username, password);
    console.log(user);
    const authToken = await user.authorize();

    return res.json(makeGoodResponse(authToken.token));
  } catch (err) {
    console.log(err);
    return res.status(400).send(makeErrorResponse('invalid username or password'));
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
  console.log('Old password = ', oldPassword, 'New password = ', newPassword);
  if (!oldPassword || !newPassword) {
    res.status(400).send(makeErrorResponse('Both passwords shouldn\'t be empty'));
  }

  if (oldPassword === newPassword) {
    res.status(400).send(makeErrorResponse('Passwords can\'t be the same'));
    return;
  }

  if (req.user) {
    if (!req.user.validPassword(oldPassword)) {
      res.status(400).send(makeErrorResponse('Old password incorrect'));
      return;
    }

    req.user.update({ password: newPassword });
  } else {
    res.send.makeErrorResponse('User isn\'t autorized');
    return;
  }
  res.send(makeGoodResponse('Password changed'));
});

module.exports = router;
