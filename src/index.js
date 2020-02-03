import Express from 'express';
import bodyparser from 'body-parser';
import db from '../models';
import UserController from '../ controllers/user-controller';

const app = new Express();

app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());
db.sequelize.sync();
app.use(UserController);
app.listen(3000);
console.log('Running on http://localhost:3000');
