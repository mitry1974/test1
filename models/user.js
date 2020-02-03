'use strict';

import bcrypt from 'bcrypt';

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
      beforeCreate: (user) => {
        const salt = bcrypt.genSaltSync();
        user.password = bcrypt.hashSync(user.password, salt);
      }
    },
    instanceMethods: {
      validPassword: function (password) {
        return bcrypt.compareSync(password, this.password);
      }
    }
  });
  User.associate = function (models) {
    User.hasMany(models.AuthToken);
  };

  return User;
};

User.authenticate = async function (username, password) {

  const user = await User.findOne({ where: { username } });

  if (bcrypt.compareSync(password, user.password)) {
    return user.authorize();
  }
  throw new Error('invalid password');
}

User.prototype.authorize = async function () {
  const { AuthToken } = sequelize.models;
  const user = this
  const authToken = await AuthToken.generate(this.id);

  await user.addAuthToken(authToken);

  return { user, authToken };
};


User.prototype.logout = async function (token) {
  sequelize.models.AuthToken.destroy({ where: { token } });
};
