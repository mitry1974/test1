'use strict';

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

const validPassword = (user, password) => {
  return bcrypt.compareSync(password, user.password);
};

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    email: DataTypes.STRING,
    username: DataTypes.STRING,
    password: DataTypes.STRING
  }, {
    timestamps: false,
    hooks: {
      beforeCreate: encryptPasswordIfChanged,
      beforeUpdate: encryptPasswordIfChanged,
    },
    instanceMethods: {}
  }
  )

User.associate = function (models) {
  User.hasMany(models.AuthToken);
};

User.authenticate = async function (username, password) {

  const user = await User.findOne({ where: { username } });
  if (!user) {
    throw new Error('user not found');
  }

  if (!validPassword(user, password)) {
    throw new Error('invalid password');
  }
  return user;
}

User.prototype.authorize = async function () {
  const { AuthToken } = sequelize.models;
  const user = this
  const authToken = await AuthToken.generate(this);

  await user.addAuthToken(authToken);

  return authToken;
};


User.prototype.logout = async function (token) {
  sequelize.models.AuthToken.destroy({ where: { token } });
};

return User;
};

