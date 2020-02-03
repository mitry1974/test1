'use strict';

import bcrypt from 'bcrypt';
import comparePassword from '../utils/authUtils';

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

  User.authenticate = async function (username, password) {

    const user = await User.findOne({ where: { username } });
    if (!user) {
      throw new Error('user not found');
    }

    if (!comparePassword(user, password)) {
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

