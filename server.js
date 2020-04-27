const express = require('express')
const app = express()
const userRouter = require('./routes/users')
require('./db/mongoose')
const port = process.env.PORT || 8080

app.use(express.json())
app.use(userRouter)

app.listen(port, () => {
    console.log('Listening on port ' + port)
})