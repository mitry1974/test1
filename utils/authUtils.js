import bcrypt from 'bcrypt';

export default (user, password) => bcrypt.compareSync(password, user.password);
