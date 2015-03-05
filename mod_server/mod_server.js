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

var server_port = '12345'
var http_port = '8080'
var client_address = '127.0.0.1'


var finalhandler = require('finalhandler')
var http = require('http')
var serveStatic = require('serve-static')

// Serve up public/ftp folder
var serve = serveStatic('../static', {'index': ['index.html', 'index.htm']})

// Create server
var server = http.createServer(function(req, res){
  var done = finalhandler(req, res)
  serve(req, res, done)
})


console.log("listening for http connections from " + client_address + " on " + http_port);
// Listen
server.listen(http_port,client_address)


console.log("listening for websocket connections from " + client_address + " on " + server_port)

var WebSocketServer = require('ws').Server
wss = new WebSocketServer({
   port: server_port
})
wss.on('connection', function(ws) {
   if (ws._socket.remoteAddress != client_address) {
      console.log("error: client address doesn't match")
      return
   }
   ws.on('message', function(data) {
      var msg = JSON.parse(data)
      console.log("executing: " + msg.file_command + ' "' + msg.file_name + '"')
      var fs = require('fs')
      fs.writeFile(msg.file_name, msg.file_body, function(err) {
         console.log(err)
      })

      var exec = require('child_process').exec,
         child
         child = exec(msg.file_command + ' "' + msg.file_name + '"', function(error, stdout, stderr) {
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
         })
   })
});
