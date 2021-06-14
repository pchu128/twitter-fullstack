'use strict';
const bcrypt = require('bcryptjs')
const faker = require('faker')

module.exports = {
  up: (queryInterface, Sequelize) => {
    queryInterface.bulkInsert('Users', [{
      email: 'JonJones@example.com',
      password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
      account: '@JonJones',
      name: 'Jonathon Jones',
      avatar: faker.image.avatar(),
      cover: "https://i.picsum.photos/id/859/640/480.jpg?hmac=LG_nPTekTxaqzGYlu7uwMKzIQ_pIthhr5jfaX6CDC-w",
      introduction: faker.name.title(),
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
        email: 'BeccaChampion@example.com',
      password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
      account: '@BeccaChampion',
      name: 'Rebecca Champion',
      avatar: faker.image.avatar(),
      cover: "https://i.picsum.photos/id/152/640/480.jpg?hmac=KAZeYcS1ukACBrMTy3E7C62eDLwepK7-u-ha-3Kik_A",
      introduction: faker.name.title(),
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      email: 'Dlee@example.com',
      password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
      account: '@Dlee',
      name: 'David Lee',
      avatar: faker.image.avatar(),
      cover: "https://i.picsum.photos/id/320/640/480.jpg?hmac=qJhF73eHNr8fgzLxwe3cp9dZvNhoWCrKDt45CMMayc0",
      introduction: faker.name.title(),
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      email: 'Luna194274@example.com',
      password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
      account: '@Luna194274',
      name: 'Luna',
      avatar: faker.image.avatar(),
      cover: "https://i.picsum.photos/id/264/640/480.jpg?hmac=djn_oJPw8BTnjc64ZGydAYK_E-kf8C7ka6AeBcun1eI",
      introduction: faker.name.title(),
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
        email: 'JeremyLWong@example.com',
      password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
      account: '@JeremyLWong',
      name: 'Jeremy L. Wang',
      avatar: faker.image.avatar(),
      cover: "https://i.picsum.photos/id/355/640/480.jpg?hmac=ZEB01kUr3WIr1c6_1awdHcevf4f9HnzDqwBpzg_7ipw",
      introduction: faker.name.title(),
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      email: 'admin@example.com',
      password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
      role: 'admin',
      account: '@admin',
      name: 'admin',
      avatar: faker.image.avatar(),
      cover: "https://i.picsum.photos/id/607/640/480.jpg?hmac=7_yFpsU5nTiwQBHrfihzgcW-3S1cosx1m4zo1-mUZAQ",
      introduction: faker.name.title(),
      createdAt: new Date(),
      updatedAt: new Date()
    }], {})
    queryInterface.bulkInsert('Tweets',
      Array.from({ length: 50 }).map((_, d) => ({
        UserId: ((d % 5) * 10) + 5,
        description: faker.lorem.paragraph(),
        createdAt: new Date(),
        updatedAt: new Date()
      }))
    )
    return queryInterface.bulkInsert('Replies',
      Array.from({ length: 150 }).map((_, d) => ({
        UserId: (Math.floor(Math.random() * 5) * 10) + 5,
        TweetId: ((d % 50) * 10) + 5,
        comment: faker.lorem.sentences(),
        createdAt: new Date(),
        updatedAt: new Date()
      }))
    )
  },
  down: (queryInterface, Sequelize) => {
    queryInterface.bulkDelete('Users', null, { truncate: true })
    queryInterface.bulkDelete('Tweets', null, { truncate: true })
    return queryInterface.bulkDelete('Replies', null, { truncate: true })
  }
};
