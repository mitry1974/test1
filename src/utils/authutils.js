import bcrypt from 'bcrypt';

const encryptPassword = (password) => {
  const salt = bcrypt.genSaltSync();
  return bcrypt.hashSync(password, salt);
};

const encryptPasswordIfChanged = (user, options) => {
  if (user.changed('password')) {
    user.password = encryptPassword(user.get('password'));
  }
}

const validatePassword = (user, password) => {
  console.log('validate password, user.password = ', user.password, 'new password = ', password);
  const res = bcrypt.compareSync(password, user.password);
  console.log('validate password, res = ', res);
  return res;
};

export { encryptPassword, encryptPasswordIfChanged, validatePassword };