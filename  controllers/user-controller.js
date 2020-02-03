import express from 'express';
import { User } from '../models';

const router = express.Router();

router.post('/registration', async (req, res) => {
  try {
    const user = await User.create(req.body);
    const authData = await user.authorize();

    return res.json({
      ok:true,
      message: '',
      data: authData,
    });

  } catch (err) {
    console.log(err);
    return res.status(400).send(err);
  }
});

router.post('/auth', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send(
      'Request missing username or password param'
    );
  }

  try {
    let user = await User.authenticate(username, password)

    user = await user.authorize();

    return res.json(user);

  } catch (err) {
    return res.status(400).send('invalid username or password');
  }

});

router.get('/user', (req, res) => {
  if (req.user) {
    return res.send(req.user);
  }
  res.status(404).send(
    { errors: [{ message: 'missing auth token' }] }
  );
});

router.post('/changepassword', (req, res) => {
  res.send('authorization');
});

module.exports = router;


