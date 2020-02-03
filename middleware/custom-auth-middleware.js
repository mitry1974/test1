const { User, AuthToken } = require('../models');

const getTokenFromHeader = (header) => {
  if (header && header.split(' ')[0] === 'Bearer') {
    return header.split(' ')[1];
  }
  return null;
};

module.exports = async function exports(req, res, next) {
  const token = getTokenFromHeader(req.cookies.auth_token || req.headers.authorization);
  if (token) {
    const authToken = await AuthToken.findOne(
      { where: { token }, include: User },
    );

    if (authToken) {
      req.user = authToken.User;
    }
  }
  next();
};
