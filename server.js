const express = require('express')
const app = express()
const userRouter = require('./routes/users')
const postRouter = require('./routes/posts')
const commentRouter = require('./routes/comments')
require('./db/mongoose')
const port = process.env.PORT || 8080

app.use(express.json())
app.use(userRouter)
app.use(postRouter)
app.use(commentRouter)

app.listen(port, () => {
    console.log('Listening on port ' + port)
})