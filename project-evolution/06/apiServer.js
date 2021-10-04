require("dotenv").config()
const PORT = process.env.API_SERVER_PORT

const express = require("express")
const app = express()

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

app.get('/posts', (req, res) => {
    res.json(posts)
})

app.listen(PORT)