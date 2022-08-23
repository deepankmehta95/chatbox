const express = require('express')
const dotenv = require('dotenv')
const colors = require('colors')

const connectDB = require('./config/db')
const userRoutes = require('./routes/userRoutes')
const chatRoutes = require('./routes/chatRoutes')
const { notFound, errorHandler } = require('./middleware/errorMiddleware')

dotenv.config()
connectDB()

const app = express()

app.use(express.json())

app.get('/', (req, res) => {
  res.send('API is running')
})

// Routes
app.use('/api/user', userRoutes)
app.use('/api/chat', chatRoutes)

// Error Handlers
app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, console.log(`Server started on PORT ${PORT}`.yellow.bold))
