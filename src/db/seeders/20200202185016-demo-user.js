
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.bulkInsert('Users', [{
    firstname: 'Snoop',
    lastname: 'Dog',
    email: 'user1g@testfakedomain.com',
    username: 'user1',
    password: '12345',
  }, {
    firstname: 'Scooby',
    lastname: 'Doo',
    email: 'user2@testfakedomain.com',
    username: 'user2',
    password: '12345',
  }, {
    firstname: 'Herbie',
    lastname: 'Husker',
    email: 'user3@testfakedomain.com',
    username: 'user3',
    password: '12345',
  }], {}),

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('People', null, {});
    */
  },
};
