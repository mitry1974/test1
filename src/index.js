import express from 'express';

const app = express();

app.get('/', (req, res) => {
  res.send('The best way to manage your Node app using Docker\n');
});

app.post('/registration', (req, res) => {
  res.send('registration');
});

app.post('/auth', (req, res) => {
  res.send('authorization');
});

app.post('/changepassword', (req, res) => {
  res.send('authorization');
});

app.get('/user', (req, res) => {
  res.send('user');
});

app.listen(3000);
console.log('Running on http://localhost:3000');
