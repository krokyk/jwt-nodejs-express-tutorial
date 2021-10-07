require("dotenv").config()
const PORT = process.env.AUTH_SERVER_PORT

const express = require("express")
const app = express()
app.use(express.json())
const jwt = require("jsonwebtoken")

app.post("/login", (req, res) => {
    // Authenticate user

    const username = req.body.username
    const user = { name: username }

    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)
    res.json({ accessToken: accessToken })
})

function verifyToken(req, res, next) {
    const authHeader = req.headers["authorization"]
    const token = authHeader && authHeader.split(" ")[1]
    if (token == null) return res.sendStatus(401)
    
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
        if (err) return res.sendStatus(403)
        req.user = { name: payload.name }
        next()
    })
}

app.listen(PORT)