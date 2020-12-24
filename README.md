# chrysalis

## Setup

You will need to install a few packages to build the project.

First, install npm for your system.  On a Linux system, this is 
`sudo apt get install npm`.  On Windows or MacOS, you will use an installer
from https://www.npmjs.com/get-npm.

Next, install the required developer dependencies:

`npm install peerjs`
`npm install -D typescript`
`npm install -D html-webpack-plugin`
`npm install -D webpack`
`npm install -D webpack-cli`
`npm install -D gl-matrix`

## Building

Open the root folder using VSCode.  Ctrl-Shift-B and select the "build" task.
This will run both the typescript compiler (tsc) and webpack.  Final output is
written to the `dist` folder.

## Running

From the `dist` folder, use the Python HTTP server:

`$ python -m http.server 8088`

Then you can browse to http://localhost:8088/



