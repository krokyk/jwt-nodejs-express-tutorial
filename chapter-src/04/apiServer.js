require("dotenv").config()
const PORT = process.env.API_SERVER_PORT

const express = require("express")
const app = express()

app.listen(PORT)