const express = require('express')
const router = express.Router()

const passport = require('passport')
const User = require('../../models/user')

router.get('/login', (req, res) => {
  res.render('login')
})

router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/users/login'
}))

router.get('/register', (req, res) => {
  res.render('register')
})

router.post('/register', (req, res) => {
  // 取得註冊表單參數
  const { name, email, password, confirmPassword } = req.body
  // 註冊資訊警告框
  const errors = []
  if (!name || !email || !password || !confirmPassword) {
    errors.push({ message: '所有欄位都是必填。' })
  }
  if (password !== confirmPassword) {
    errors.push({ message: '密碼輸入不一致。' })
  }
  if (errors.length) {
    return res.render('register', { errors, name, email, password, confirmPassword }) // 將錯誤訊息一起傳到樣板準備渲染
  }

  // 檢查使用者是否已經註冊
  User.findOne({ email }).then(user => {
    // 如果已註冊：退回原畫面
    if (user) {
      errors.push({ message: '這個 Email 已經註冊過了。' })
      return res.render('register', { errors, name, email, password, confirmPassword })
    }
    // 如果還沒註冊：寫入資料庫
    return User.create({ name, email, password })
      .then(() => res.redirect('/'))
      .catch(err => console.error(err))

  })
    .catch(err => console.error(err))
})

router.get('/logout', (req, res) => {
  req.logout()
  req.flash('success_msg', '你已經成功登出。')
  res.redirect('/users/login')
})

module.exports = router