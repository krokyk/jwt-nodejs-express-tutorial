# 01 - Initialize the Project

```
npm init -y
```

# 02 - Install Required Libraries

```
npm install express jsonwebtoken dotenv
```
* `express` for our server code and API endpoints
* `jsonwebtoken` for working with _JWT_
* `dotenv` to store our sensitive and configuration stuff inside the `.env` file (like secrets or ports)

Install the development dependency `nodemon` which will automatically restart the server as you make changes to the code:
```
npm install --save-dev nodemon
```

# 03 - Create Project Files

* `apiServer.js` will contain our API code
* `.env` will contain our configuration

Inside the `package.json`, hook the `nodemon` to run newly created `apiServer.js`:
```json
  "scripts": {
    "apiStart": "nodemon apiServer.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
```
You can now try to run the `apiServer.js` with `nodemon`:

```
npm run apiStart
```

Now, without quitting the server, try adding
```javascript
console.log("Hi!")
```
to the `apiServer.js` and you should see the output in the terminal immediately after you save the file, because `nodemon` is monitoring it.

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

<div id="06"></div>

# 06 - Use the [REST Client Extension](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) to Display Data

It can run requests defined in the `*.rest` files.
File can contain multiple requests separated by three (or more) `###`.
Create file `requests.rest` in your project with following content:
```
#######################################
GET http://localhost:3000/posts
```

Now, you can click on `Send Request` and the resulting response will open in the new split window.

This is all nice, but what if you don't want to display the whole content to anyone, but only the content they are authors of?
You need to add some authentication and authorization to the server to do that.

# 07 - Add an Authentication Endpoint

* Create a <kbd>POST</kbd>`/login` endpoint in `apiServer.js`.
* It's <kbd>POST</kbd>, because you are going to be sending data (credentials) to the server.
* Since the request body will be in a JSON format, you need to tell that to the server by configuring the middleware, so it understands the body of such requests. To configure _Express.js_ in such a way use this construct:
  ```javascript
  app.use(express.json())
  ```
  >**:information_source: INFO:** In short, middleware are those methods/functions/operations that are called **_between_** receiving the request and  sending back the response.
* The endpoint should take care of the authentication of the user, but this is not in scope of this tutorial.
  You can just assume the authentication was successful and the user really is who he claims to be.
  Add this to the `apiServer.js`:
  ```javascript
  app.post("/login", (req, res) => {
    // Authenticate user
  })
  ```
* So take the `username` from the request body and use it in creation of `user` object that will be stored inside the generated token. Add this to the <kbd>POST</kbd>`/login` endpoint method:
  ```javascript
    const username = req.body.username
    const user = { name: username }
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
* Store the secret inside the `.env` file. You can use _Node.js_ `crypto` library to generate a strong secret (e.g. 64 random bytes converted to a hexadecimal string).
  ```bash
  node -p "require('crypto').randomBytes(64).toString('hex')"
  ```

# 08 - Test the POST `/login` Endpoint

Add the <kbd>POST</kbd>`/login` request to the `requests.rest`:
```
#######################################
POST http://localhost:3000/login
Content-Type: application/json

{
    "username": "Jane",
    "password": "abcd"
}
```

That gibberish is actually our access token holding the information we've put in it (our `user` JSON object) along with some other stuff, added automatically by the `jsonwebtoken` library. **CHECK IT OUT AT https://jwt.io/**

# 09 - Verify the Access Token in the Middleware

* in `apiServer.js` create a middleware function (or _route handler_) called `verifyToken`
  ```javascript
  function verifyToken(req, res, next) {

  }
  ```
* add it to the <kbd>GET</kbd>`/posts` endpoint to the chain of our _route handlers_
  ```javascript
  app.get("/posts", verifyToken, (req, res) => {
      res.json(posts)
  })
  ```
Inside `verifyToken` function:
* extract the _Authorization_ header from the request
  ```javascript
      const authHeader = req.headers["authorization"]
  ```
* Verify there is actually such header and if yes, get the token from it.
Since _Authorization_ header value will be in format `Bearer <token>`, split it (on the `space` character) and take the second array element from it
  ```javascript
      const token = authHeader && authHeader.split(" ")[1]
  ```
* if the header is not there or the value of the header is malformed somehow (e.g. there's no space between `Bearer` and `<token>`), return **_401 Unauthorized_** HTTP status
  ```javascript
      if (token == null) return res.sendStatus(401)
  ```
* otherwise, proceed to the verification of the token itself.
If there's an error, return **_403 Forbidden_** HTTP status. If not, pass the control to the `next` _route handler_ in sequence
  ```javascript
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
          if (err) return res.sendStatus(403)
          next()
      })
  ```

# 10 - Test the GET `/posts` Endpoint

1. send **no token**
2. send **wrong token**
3. send **correct token**

>**:bulb: TIP:** You will certainly get a different token than in the code snippet above, because it changes everytime the timestamp changes on your system.
The reason is that in the token's payload the `"iat"` JSON field (generated automatically by the `jsonwebtoken` library) contains the current timestamp.
It stands for _Issued At_ and holds the token creation timestamp (in seconds).
It's one of the [standard JWT claims](https://www.iana.org/assignments/jwt/jwt.xhtml).


So how do you filter the data in the response based on the author?

# 11 - Filter the Data Based on the Token

In order to do that, you just need to use the information that is inside the token's payload, field `name`.
>**:bulb: TIP:** Use `console.log(payload)` to see what's in there whenever this _route handler_ is ivoked.
You should see something like this in the terminal:
>```javascript
>   { name: 'Jane', iat: 1633526601 }
>```
Just before passing the processing of the request to the `next` _route handler_, add a custom JSON object `user` to the request.
This object has a single field `name` with value coming from the token payload's field `name`:
```javascript
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
        if (err) return res.sendStatus(403)
        req.user = { name: payload.name }
        next()
    })
```
In the last _route handler_ in <kbd>GET</kbd>`/posts` endpoint, instead of returning the full `posts` array, filter it based on post's `author` field:
```javascript
    res.json(posts.filter(p => p.author === req.user.name))
```

# 12 - Working with JWTs across Different Servers

To see how easy it is to work with the token across different servers (meaning you login on server "A" and display the posts on server "B"), make a copy of the `apiServer.js` and call it `authServer.js`.

Add a startup command for the new server to the `package.json`, just after the `"apiStart":` field :
```json
    "authStart": "nodemon authServer.js",
```
Add new `AUTH_SERVER_PORT` env variable to `.env` file:
```properties
AUTH_SERVER_PORT=4000
```
And use it for the `PORT` of your new `authServer.js`:
```javascript
const PORT = process.env.AUTH_SERVER_PORT
```

Now that both servers are running, in `requests.rest` alter the <kbd>POST</kbd>`/login` request to use port 4000 (i.e. different server)

Try out the login request on the new server (`port 4000`) and API on the old one (`port 3000`)

Key thing here is that both servers share the same `ACCESS_TOKEN_SECRET` and thus are able to work with the token that was signed by it.
This is something that would be hard to do if you used sessions to handle this type of situation, because session is bound to a particular server.
But with JWT, the needed information is actually stored within the token itself and once issued, it lives on its own inside the requests themselves.

# 13 - Cleanup the Server Code

**API:**
* remove the whole <kbd>POST</kbd>`/login` endpoint

**AUTH:**
* remove the whole <kbd>GET</kbd>`/posts` endpoint
* remove the `posts` array

Keep the `verifyToken` function in both.

# 14 - Set Expiration for the Access Token

**NOW:**, stop for a moment and think about the access token.
* access token can be used indefinitely - **NOT SECURE**
* how to invalidate it?
  * change ACCESS_TOKEN_SECRET - that will invalidate **all tokens** that were ever signed by that secret in the past. Maybe that's not what you want to do.

* one of the most common ways is to set an expiration time - depending on the use case, usually minutes, hours or days
* The shorter the expiration time is, the more secure the token becomes.
* In case the token is stolen, it can be only used for a limited period of time.

Add a utility method
```javascript
function createAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15s" })
}
```

and change how the `accessToken` is generated in the <kbd>POST</kbd>`/login` endpoint in `authServer.js`:
```javascript
    const accessToken = createAccessToken(user)
```

Test <kbd>POST</kbd>`/posts` now and check https://jwt.io

# 15 - Create a Refresh Token

**NOW:**
* token cannot be used indefinitely
* access token expires - what to do?
* login again
  * not a good user experience
  * authenticating a user can be a costly operation.

Here's where refresh tokens come into play.

* after user logs in, response contains **BOTH** access and refresh tokens
* just another JWT
* access token is **short-lived**, refresh token is **long-lived**
* we will create refresh token that will have _no expiration_
  * expiration (or invalidation) explicitly in the code, (e.g. `/logout`)
* access token expires -> new accessToken via refreshToken

To generate a new secret for the refresh token, run this in the terminal:
```bash
node -p "require('crypto').randomBytes(64).toString('hex')"
```

Create `REFRESH_TOKEN_SECRET` environment variable in the `.env` file with the generated value, e.g.:
```properties
REFRESH_TOKEN_SECRET=d734cf2b229686c7f0314fb680559c7822b381ae7f357cbf46967afd3fe2151677f907da3bb2acd7603939e989cdda24438def585436dd2cdb958680766d7966
```

In order to keep track of the refresh tokens and to have an ability to invalidate them, you need to store them somewhere.
Usually it's done in a fast database like [Redis](https://redis.io/).
In this tutorial you will just use an array of refresh tokens inside the `authServer.js` code.
Declare an empty array of refresh tokens before the <kbd>POST</kbd>`/login` endpoint:
```javascript
let refreshTokens = []
```

Change the <kbd>POST</kbd>`/login` endpoint to also create a refresh token.
Remember, refresh token has no expiration.
Add this under the creation of the access token:
```javascript
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET)
```

Store the new refresh token in the array you created and add it to the existing response.
```javascript
    refreshTokens.push(refreshToken)
    res.json({ accessToken: accessToken, refreshToken: refreshToken })
```

Finally, test your changes by sending a <kbd>POST</kbd>`/login` request to the server.
You will get a response containing access AND refresh token:

# 16 - Getting a New Access Token Based on a Refresh Token

**AUTH:**
* adjust `verifyToken`  to work with the _refresh tokens_.
  * if the `Authorization` header contains seemingly valid token it will next check `refreshTokens` "storage" that you created in the previous chapter for an existence of the incoming refresh token to confirm that such token was indeed issued previously and return **_403 Forbidden_** if it wasn't
  ```javascript
      if (!refreshTokens.includes(token)) return res.sendStatus(403)
  ```
* since it's not an access token now but refresh token, you must use the correct secret to verify the signature in `jwt.verify()` function:
  ```javascript
      jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, payload) => {
  ```

Create a new <kbd>GET</kbd>`/accessToken` endpoint in `authServer.js` that will verify the refresh token in the request (using the adjusted `verifyToken` _route handler_) and return a new access token valid for another 15s:
```javascript
app.get("/accessToken", verifyToken, (req, res) => {
    const user = req.user
    const accessToken = createAccessToken(user)
    res.json({ accessToken: accessToken })
})
```

Now, when user's _access token_ expires, he's able to request a new one by calling the <kbd>GET</kbd>`/accessToken` given that a valid _refresh token_ is provided in the header.
All this without being required to login again.

Add the new request to `requests.rest` to try it out:
```
#######################################
GET http://localhost:4000/accessToken
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiSmFuZSIsImlhdCI6MTYzNDUwOTUxNX0.pM4SAXRNy4QcCdFgmtr5xmSKazkF-V-RXEJKT2nu5us
```

# 17 - Add a Logout Endpoint

As long as the server has the _refresh token_ in its storage, user is able to use it to get the new _access token_.
If you login, you get a refresh token which is stored in the `refreshTokens` array and as long as it is there, you can use it indefinitely to get a new valid access token.

Let's create a <kbd>DELETE</kbd>`/logout` endpoint in `authServer.js` that will remove the supplied refresh token from the server's storage so that nobody will be able to use it anymore to get an access token.
>**:bulb: TIP:** Even though it can be virtually any HTTP method, make it a <kbd>DELETE</kbd> because you will be deleting something from the server.
```javascript
app.delete("/logout", (req, res) => {
    const refreshToken = req.body.refreshToken
    refreshTokens = refreshTokens.filter(token => token !== refreshToken)
    res.sendStatus(204)
})
```

To test the endpoint, create a new request in `requests.rest`:
```
#######################################
DELETE http://localhost:4000/logout
Content-Type: application/json

{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiSmFuZSIsImlhdCI6MTYzNTAwNjI1NX0.1ktdYG8iENKlrbMs5iSmiUkbsUd-9lkCmuqnYA3mthc"
}
```

If everything is correct, you will receive **204 No Content** HTTP status in the response.
The server will remove the token it got in the request body from the `refreshTokens` array and this refresh token will no longer work in the <kbd>GET</kbd>`/accessToken` endpoint.

You might be asking yourself, what about the access token?
Nothing was done about it in the <kbd>DELETE</kbd>`/logout` endpoint.
Well yes, it will still work but that's why you set a short expiration in it.

>**:bulb: TIP:** Read this [blog post](https://medium.com/devgorilla/how-to-log-out-when-using-jwt-a8c7823e8a6) to get some ideas on how to implement logout functionality with JWTs.
>
>It is said that using JWT should be stateless, meaning that you should store everything you need in the payload and skip performing a DB query on every request.
>But if you plan to have a strict log out functionality, that cannot wait for the token auto-expiration, even though you have cleaned the token from the client side, then you might need to neglect the stateless logic and do some queries.
>
>An implementation would probably be to store a so-called "blacklist" of all the tokens that should be valid no more but have not expired yet.
>You can use a DB that has TTL option on documents which would be set to the amount of time left until the token is expired.
>**Redis** is a good option for this, that will allow fast in memory access to the list.
>Then, in a middleware that runs on every authorized request, you should check if provided token is in The Blacklist.
>If it is, you should throw an unauthorized error.
>And if it is not, let it go and the JWT verification will handle it and identify whether it is expired or still active.
>
>In short, you should follow these 4 points:
>1. Set a reasonable expiration time on tokens
>2. Delete the stored token from client side upon log out
>3. Have DB of no longer active tokens that still have some time to live
>4. Query provided token against The Blacklist on every authorized request
