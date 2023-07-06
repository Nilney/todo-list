const express = require('express')
const session = require('express-session')
const exphbs = require('express-handlebars')
const methodOverride = require('method-override')

const routes = require('./routes')
require('./config/mongoose')

const app = express()
const PORT = process.env.PORT || 3000

app.engine('hbs', exphbs({ defaultLayout: 'main', extname: '.hbs' }))
app.set('view engine', 'hbs')

app.use(session({
  secret: 'This is my secret',
  resave: false,
  saveUninitialized: true
}))
app.use(express.urlencoded({ extended: true })) //直接從 express 呼叫 body-parser
app.use(methodOverride('_method')) // 設定每一筆請求都會先以 methodOverride 進行前置處理

app.use(routes)

app.listen(PORT, () => {
  console.log(`App is running on http://localhost:${PORT}`)
})