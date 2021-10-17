require("dotenv").config()
const PORT = process.env.API_SERVER_PORT

const express = require("express")
const app = express()
app.use(express.json())
const jwt = require("jsonwebtoken")

const posts = [
    {
        author: "Jane",
        title: "Post 1"
    },
    {
        author: "John",
        title: "Post 2"
    }
]

app.get("/posts", verifyToken, (req, res) => {
    res.json(posts.filter(p => p.author === req.user.name))
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