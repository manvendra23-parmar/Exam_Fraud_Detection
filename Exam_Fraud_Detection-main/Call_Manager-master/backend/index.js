const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')
const router = require('./routes/index')

dotenv.config()

const PORT = process.env.PORT || 5050
const app = express()

// Middleware
app.use(cors())
app.use(express.json({ limit: "50mb" }))
app.use(express.urlencoded({ extended: true, limit: "50mb" }))

// Routes
app.use("/api", router)

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})
