
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable('AuthTokens', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    token: {
      type: Sequelize.STRING,
    },
    UserId: {
      allowNull: false,
      type: Sequelize.INTEGER,
    },
  }),
  down: (queryInterface, Sequelize) => queryInterface.dropTable('AuthTokens'),
};
