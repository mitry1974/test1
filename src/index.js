import Express from 'express';
import bodyparser from 'body-parser';
import cookieparser from 'cookie-parser';
import db from '../models';
import UserController from '../ controllers/user-controller';
import customAuthMiddleware from '../middleware/custom-auth-middleware';

const app = new Express();

app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());
app.use(cookieparser());
app.use(customAuthMiddleware);
db.sequelize.sync();
app.use(UserController);
app.listen(3000);
console.log('Running on http://localhost:3000');
