<p align="center">
  <img src="images/logo.png" height="100" />
  <h1 align="center">JWT + Node.js + Express Tutorial</h1>
</p>

Simple example on how to work with _JWT_ using _Node.js_ and _Express.js_ with _VSCode_ running in _WSL_ with _Ubuntu_ distro.

>**Disclaimer:** I was heavily inspired by [this great video tutorial](https://www.youtube.com/watch?v=mbsmsi7l3r4) by [Web Dev Simplified](https://www.youtube.com/channel/UCFbNIlppjAuEX4znoulh0Cw)

# Prerequisites
* [Visual Studio Code on WSL](https://code.visualstudio.com/docs/remote/wsl)
    * VSCode extension [Remote - WSL](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-wsl)
    * VSCode extension [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) - you can use any other REST client you are comfortable with, e.g. [Postman](https://www.postman.com/).
    We will use it to test the calls to the API endpoints we're going to create
* [nvm, node.js and npm](https://docs.microsoft.com/en-us/windows/dev-environment/javascript/nodejs-on-wsl#install-nvm-nodejs-and-npm) on _WSL_ (the instructions are perfectly OK for _WSL 1_, too) - install the recommended LTS version of the node.js

>**Note**: Actually you don't need to use _VSCode_ or _WSL_, it's up to you. I chose this combination because:
* VSCode is a great IDE and works very well with Node.js
* It has a very powerful integrated terminal 
* I like Bash shell more than Windows PowerShell or Cmd 

# Setting up the Workspace
There are several ways to open the _WSL_ prompt, one is to hit <kbd>WIN</kbd>+<kbd>R</kbd> to open the _Run_ dialog and typing `wsl` into the text box followed by <kbd>ENTER</kbd>. A _WSL_ prompt should open like this:

![WSL Prompt](images/wsl-prompt.png)

Next, you're going to create a `vscode` dir in your user home directory and clone this repository into it. In _WSL_ prompt, type:
```
cd ~ && mkdir vscode && cd vscode/
```
```
git clone https://github.com/krokyk/jwt-nodejs-express-tutorial.git
```
>**:bulb: TIP:** You can also clone the repository using SSH but you need to [setup your SSH keys](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/adding-a-new-ssh-key-to-your-github-account) first:
>```
>git clone git@github.com:krokyk/jwt-nodejs-express-tutorial.git
>```

>**:bulb: TIP:** You can also just [download the ZIP](https://github.com/krokyk/jwt-nodejs-express-tutorial/archive/refs/heads/main.zip) archive of this project from github and unzip it into the `vscode` dir (rename the folder to `jwt-nodejs-express-tutorial` if necessary).

Now, launch _VSCode_ in the newly created dir
```
code jwt-nodejs-express-tutorial/
```
You can close _WSL_ prompt now. We will be working exclusively in _VSCode_ from now on.

Inspect the contents of the project.
You can ignore the `images` dir (it contains images for this readme) but take a look into the one called `project-evolution`.

This dir holds files arranged into subdirs which reflect their "evolution" as they are created/changed.
These subdirs are numbered and each number represents a certain state of the project content.
The content matches the content you should have in your project root dir if you follow the tutorial.
The subchapters here are numbered the same way, so after you finish one subchapter, your files should have the same content as those you find under `project-evolution` subdir with the same number.

>**:bulb: TIP:** It's best to compare the contents of the project dir with each of the subdirs in `project-evolution` dir as you go through the tutorial chapters. You can use any tool that is able to compare the directory contents and easily display changed files and then compare those files to see what the change from that chapter is. My tool of choice for that is [Beyond Compare](https://www.scootersoftware.com/)

# 01 - Initialize the Project

```
npm init -y
```
Notice that `package.json` was created with some default values derived from our current content.

# 02 - Install Required Libraries

```
npm install express jsonwebtoken dotenv
```
* `express` for our server code and API endpoints
* `jsonwebtoken` for working with _JWT_
* `dotenv` to store our sensitive and configuration stuff inside the `.env` file (like secrets or ports)

Install the development dependency `nodemon` which will automatically restart our server as we make changes to the code:
```
npm install --save-dev nodemon
```

# 03 - Create Project Files

```
touch apiServer.js && touch .env
```
* `apiServer.js` will contain our API code
* `.env` will contain our configuration

Inside the `package.json` we will hook the `nodemon` to run our newly created `apiServer.js`:
```json
  "scripts": {
    "devStart": "nodemon apiServer.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
```
You can now try to run the `apiServer.js` with `nodemon`:

```
npm run devStart
```
![Nodemon starts](images/03-01.png)

Now, without quitting the server, try adding
```javascript
console.log("Hi!")
```
to the `apiServer.js` and you should see the output in the terminal immediately after you save the file, because `nodemon` is monitoring it.

![Nodemon refreshes the server](images/03-02.png)

# 04 - Let’s Create API Server

Add `API_SERVER_PORT` env variable to `.env` file:
```properties
API_SERVER_PORT=3000
```
And this to the empty `apiServer.js`:
```javascript
require("dotenv").config()
const PORT = process.env.API_SERVER_PORT

const express = require("express")
const app = express()

app.listen(PORT)
```
It will do nothing yet, just listen on the port configured via `.env`.

# 05 - Return Some Data

Create a <kbd>GET</kbd>`/posts` endpoint in `apiServer.js` that returns a simple JSON object containing 2 posts:
```javascript
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

app.get("/posts", (req, res) => {
    res.json(posts)
})
```
You can test the endpoint by opening http://localhost:3000/posts in your browser.
But we're going to...

# 06 - Use the [REST Client Extension](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) to Display Data

It can run requests defined in the `*.rest` files.
File can contain multiple requests separated by three (or more) `###`.
Create file `requests.rest` in your project by running this in terminal:
```
touch requests.rest
```
With following content:
```http
#######################################
GET http://localhost:3000/posts
```
In the editor, it will look like this:

![requests.rest](images/06-01.png)

Now, you can click on `Send Request` and the resulting response will open in the new split window:

![Response](images/06-02.png)

This is all nice, but what if we don't want to display the whole content to anyone, but only the content they are authors of?
We need to add some authentication to our server to do that.

# 07 - Add an Authentication Endpoint

* Create a <kbd>POST</kbd>`/login` endpoint in `apiServer.js`.
* It's <kbd>POST</kbd>, because we are going to be sending data (credentials) to the server.
* Since the request body will be in a JSON format, we need to tell that to our server by configuring the middleware, so it understands the body of such requests. To configure _Express.js_ in such a way use this construct:
  ```javascript
  app.use(express.json())
  ```
  >**:information_source: INFO:** In short, middleware are those methods/functions/operations that are called **_between_** receiving the request and  sending back the response.
* The endpoint should take care of the authentication of the user, but this is not in scope of this tutorial.
  We will just assume the authentication was successful and the user really is who he claims to be.
  Add this to the `apiServer.js`:
  ```javascript
  app.post("/login", (req, res) => {
    // Authenticate the user here, e.g. by checking username and password against a database
    // ...
  })
  ```
* So we take the `username` from the request body and use it in creation of our `user` object that we want to store inside the generated token. Add this to the <kbd>POST</kbd>`/login` endpoint method:
  ```javascript
    const username = req.body.username // username from the request
    const user = { name: username } // user object that is going to be a part of the token
  ```
* Import the `jsonwebtoken` library.
  ```javascript
  const jwt = require("jsonwebtoken")
  ```
* To create the token and send it back to the client, add this to the <kbd>POST</kbd>`/login` endpoint method:
  ```javascript
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)
    res.json({ accessToken: accessToken })
  ```
* We will store our secrets inside the `.env` file. You can use _Node.js_ `crypto` library to generate a strong secret (e.g. 64 random bytes converted to a hexadecimal string). Paste this into **terminal** (yes, you can paste the whole line, including the comment :wink:):
  ```bash
  node -p "require('crypto').randomBytes(64).toString('hex')" # -p prints out the evaluated input
  ```
  Each time you run that a new random string is generated.
  Create `ACCESS_TOKEN_SECRET` environment variable in the `.env` file with that value, e.g.:
  ```properties
  ACCESS_TOKEN_SECRET=9fef66c25daba5b9a28a59f82e4bd799c83d891f4dae047c27c60796c0b5a9732cf66b87c21836f8df1ef8580de72b4c5d1197a6e811063d3b1ed03ed4fb8bb7
  ```
