//
// mod_server.js
//   fab module server
//
// Neil Gershenfeld 
// (c) Massachusetts Institute of Technology 2014
// 
// This work may be reproduced, modified, distributed, performed, and 
// displayed for any purpose, but must acknowledge the fab modules 
// project. Copyright is retained and must be preserved. The work is 
// provided as is; no warranty is provided, and users accept all 
// liability.
//

//
// sudo apt-get install nodejs nodejs-legacy npm
// npm config set registry http://registry.npmjs.org/
// npm install ws
// node mod_server.js
//

var exec = require('child_process').exec
var WebSocketServer = require('ws').Server
var http = require('http')
var fs = require('fs')
var StaticServer = require('node-static').Server

// Handle a single WebSocket message from the webinterface
function onWsMessage(ws, data) {
  var msg = JSON.parse(data)

  if (!msg.file_command) {
    ws.send("error: " + 'No send command specified');
    return;
  }
  fs.writeFile(msg.file_name, msg.file_body, function(err) {
     if (err) {
       ws.send("error: failed to write temporary file, " + err.message)
     }

     var cmd = msg.file_command + ' "' + msg.file_name + '"';
     var child = exec(cmd, function(error, stdout, stderr) {
       fs.unlink(msg.file_name, function(err) {
         if (err) throw err
       })
       console.log("command completed: " + stdout)
       if (error == null) {
         ws.send('sent ' + msg.file_name)
       } else {
         console.log("error: " + stderr)
         ws.send("error: " + stderr)
       }
     });
  });
}

// Setup the server
function setup(options, callback) {

  var fileServer = new StaticServer('./');
  var httpServer = http.createServer(function (request, response) {
    request.addListener('end', function () {
        fileServer.serve(request, response);
    }).resume();
  });

  var wss = new WebSocketServer({
     server: httpServer
  });
  wss.on('connection', function(connection) {
    var clientAddress = connection._socket.remoteAddress;
    clientAddress = clientAddress.replace('::ffff:', ''); // might be IPv4 over IPv6
    if (clientAddress != options.allowedAddress) {
      console.log("error: client address " + clientAddress + "doesn't match");
      return
    }
    connection.on('message', function(data) {
      onWsMessage(connection, data);
    });
  });

  httpServer.listen(options.port, callback);
}

// Entrypoint for when used as script/executable
function main() {
  var options = {
    port: '12345',
    allowedAddress: '127.0.0.1'
  };

  setup(options, function(err) {
    if (err) throw err
    console.log("listening for connections from " + options.allowedAddress + " on " + options.port);
  });
}

if (!module.parent) {
  main();
};
