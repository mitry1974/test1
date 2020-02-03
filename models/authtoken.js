
import * as jwt from 'jsonwebtoken';
import crypto from 'crypto';

module.exports = (sequelize, DataTypes) => {
  const AuthToken = sequelize.define('AuthToken', {
    token: DataTypes.STRING,
  }, {
    timestamps: false,
  });

  AuthToken.associate = function associate({ User }) {
    AuthToken.belongsTo(User);
  };

  AuthToken.generate = async function generate(user) {
    if (!user) {
      throw new Error('AuthToken requires a user ID');
    }

    const buf = crypto.randomBytes(256);
    const payload = {
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      username: user.username,
    };

    const token = jwt.sign(payload, buf);
    return AuthToken.create({ token, UserId: user.id });
  };

  return AuthToken;
};
