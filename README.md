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
* [nvm, node.js and npm](https://docs.microsoft.com/en-us/windows/dev-environment/javascript/nodejs-on-wsl#install-nvm-nodejs-and-npm) on _WSL_ (the instructions are perfectly OK for _WSL 1_, too)

>**Note**: Actually you don't need to use _VSCode_ or _WSL_, it's up to you. I chose this combination because:
* VSCode is a great IDE and works very well with Node.js
* It has a very powerful integrated terminal 
* I like Bash shell more than Windows PowerShell or Cmd 

## Setting up the Workspace
There are several ways to open the _WSL_ prompt, one is to hit <kbd>WIN</kbd>+<kbd>R</kbd> to open the _Run_ dialog and typing `wsl` into the text box followed by <kbd>ENTER</kbd>. A _WSL_ prompt should open like this:

![WSL Prompt](images/wsl-prompt.png)

Next, you're going to create a `vscode` dir in your user home directory, clone this repository into it and launch _VSCode_ in that dir. In _WSL_ prompt, type:
```
cd ~ && mkdir vscode && cd vscode/
```
```
git clone git@github.com:krokyk/jwt-nodejs-express-tutorial.git
```
```
code jwt-nodejs-express-tutorial/
```
You can close _WSL_ prompt now. We will be working exclusively in _VSCode_ from now on.