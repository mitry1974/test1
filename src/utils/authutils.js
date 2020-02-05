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
  const res = bcrypt.compareSync(password, user.password);
  return res;
};

export { encryptPassword, encryptPasswordIfChanged, validatePassword };