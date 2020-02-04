
import bodyparser from 'body-parser';
import cookieparser from 'cookie-parser';
import UserController from './ controllers/user-controller';
import customAuthMiddleware from './middleware/custom-auth-middleware';
import db from './db/models';

export default async (application) => {
    application.use(bodyparser.urlencoded({ extended: true }));
    application.use(bodyparser.json());
    application.use(cookieparser());
    application.use(customAuthMiddleware);
    application.use(UserController);
    await db.sequelize.sync({force: true});
    /*
    application.close = async function () {
        try {
            await db.sequelize.close();
        } catch( err ) {
            console.log(err);
        }
    }
    */
}