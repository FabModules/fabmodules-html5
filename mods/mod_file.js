//
// mod_file.js
//   fab module file routines
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
// check for File support
//
if (!window.FileReader) {
   alert("error: Javascript file access not supported");
   }
//
// mod_file_basename
//    remove extension suffix
//
function mod_file_basename(name) {
   var index = name.lastIndexOf('.')
   return name.slice(0,index)
   }
//
// mod_file_call
//    load file and call handler
//
function mod_file_call(script) {
   if (document.getElementById("mod_file_call_script"))
      document.head.removeChild(document.getElementById("mod_file_call_script"))
   var head = document.getElementsByTagName('head')[0]
   var s = document.createElement("script")
   s.setAttribute("type","text/javascript")
   s.setAttribute("src",script+"?"+(new Date()).getTime()) // add date query to prevent caching
   s.setAttribute("id","mod_file_call_script")
   s.setAttribute("onload","mod_load_handler()")
   head.appendChild(s)
   }
//
// mod_file_save
//    save file
//
function mod_file_save(name,file) {
   var download_link = document.getElementById("mod_download")
   download_link.download = name
   download_link.href = "data:application/octet-stream,"+encodeURI(file)
   var click_event = document.createEvent("MouseEvents")
   click_event.initEvent("click",true,false)
   download_link.dispatchEvent(click_event)

   }
//
// mod_file_send
//    send file and command to server
//
function mod_file_send(name,file,command,server) {
   var msg = {
      file_name: name,
      file_body: file,
      file_command: command
      }
   var socket = new WebSocket("ws://"+server)
   socket.onerror = function (event) {
      mod_ui_prompt("can't connect to "+server)
      }
    socket.onopen = function (event) {
      mod_ui_prompt("sending "+name)
      socket.send(JSON.stringify(msg))
      }
   socket.onmessage = function (event) {
      mod_ui_prompt(event.data)
      socket.close()
      }
   }
   

