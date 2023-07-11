const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const FacebookStrategy = require('passport-facebook').Strategy
const bcrypt = require('bcryptjs')

const User = require('../models/user')

module.exports = app => {
  // 初始化 passport 模組
  app.use(passport.initialize())
  app.use(passport.session())

  // 設定本地登入策略
  // 將官方欄位 username 改命名為 email
  // 設定 passReqToCallback: true 取得req
  passport.use(new LocalStrategy({ usernameField: 'email', passReqToCallback: true }, (req, email, password, done) => {
    User.findOne({ email })
      .then(user => {
        if (!user) {
          return done(null, false, req.flash('login_err', 'That email is not registered!'))
        }
        return bcrypt.compare(password, user.password).then(isMatch => {
          if (!isMatch) {
            return done(null, false, req.flash('login_err', 'Email or Password incorrect.'))
          }
          return done(null, user)
        })
      })
      .catch(err => done(err, false))
  }))

  // 設定 Facebook 登入策略
  passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_ID,
    clientSecret: process.env.FACEBOOK_SECRET,
    callbackURL: process.env.FACEBOOK_CALLBACK,
    profileFields: ['email', 'displayName']
  },
    (accessToken, refreshToken, profile, done) => { // cb 根據教材改成 done
      const {email, name} = profile._json
      User.findOne({email})
        .then(user => {
          if (user) return done(null, user)
          // 若沒有註冊過則往下進行
          const randomPassword = Math.random().toString(36).slice(-8)
          bcrypt
            .genSalt(10)
            .then(salt => bcrypt.hash(randomPassword, salt))
            .then(hash => User.create({
              email,
              name,
              password: hash
            }))
            .then(user => done(null, user))
            .catch(err => done(err, false))
        })
    }
  ));

  // 設定序列化與反序列化
  passport.serializeUser((user, done) => {
    done(null, user.id)
  })
  passport.deserializeUser((id, done) => {
    User.findById(id)
      .lean()
      .then(user => done(null, user))
      .catch(err => done(err, null))
  })
}