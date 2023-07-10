const express = require('express')
const router = express.Router()

const Todo = require('../../models/todo')

router.get('/new', (req, res) => {
  res.render('new')
})

// 新增 todo
router.post('/', (req, res) => {
  const userId = req.user._id
  const name = req.body.name
  return Todo.create({ name, userId })
    .then(() => res.redirect('/'))
    .catch(error => console.error(error))
})

// 查看 todo
router.get('/:id', (req, res) => {
  const userId = req.user._id
  const _id = req.params.id
  return Todo.findOne({ _id, userId})
    .lean()
    .then(todo => res.render('detail', { todo }))
    .catch(error => console.error(error))
})

// 修改 todo 頁面
router.get('/:id/edit', (req, res) => {
  const userId = req.user._id
  const _id = req.params.id
  return Todo.findOne({ _id, userId })
    .lean()
    .then(todo => res.render('edit', { todo }))
    .catch(error => console.error(error))
})

// 修改 todo
router.put('/:id', (req, res) => {
  const userId = req.user._id
  const _id = req.params.id
  const { name, isDone } = req.body
  return Todo.findOne({ _id, userId })
    .then(todo => {
      todo.name = name
      todo.isDone = isDone === 'on' // 以isDone是否等於'on'的判別結果來回傳true/false給todo.isDone
      todo.save()
    })
    .then(() => res.redirect(`/todos/${_id}`))
    .catch(error => console.error(error))
})

// 刪除 todo
router.delete('/:id', (req, res) => {
  const userId = req.user._id
  const _id = req.params.id
  return Todo.findOne({ _id, userId })
    .then(todo => todo.remove())
    .then(() => res.redirect('/'))
    .catch(error => console.error(error))
})

module.exports = router