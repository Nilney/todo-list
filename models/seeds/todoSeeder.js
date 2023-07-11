const bcrypt = require('bcryptjs')

// 非正式環境時使用dotenv 取得MONGODB_URI
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const db = require('../../config/mongoose')
const Todo = require('../todo')
const User = require('../user')

const SEED_USER = {
  name: 'root',
  email: 'root@example.com',
  password: '12345678'
}

db.once('open', () => {
  User.findOne({email: SEED_USER.email})
    .then(user => {
      if (user) {
        const userId = user._id
        return Promise.all(Array.from(
          { length: 10 },
          (_, i) => Todo.create({ name: `name-${i}`, userId })
        ))
      }
      return bcrypt
        .genSalt(10)
        .then(salt => bcrypt.hash(SEED_USER.password, salt))
        .then(hash => User.create({
          name: SEED_USER.name,
          email: SEED_USER.email,
          password: hash
        }))
        .then(user => {
          const userId = user._id
          return Promise.all(Array.from(
            { length: 10 },
            (_, i) => Todo.create({ name: `name-${i}`, userId })
          ))
        })
    })
    .then(() => {
      console.log('done.')
      process.exit()
    })
})
