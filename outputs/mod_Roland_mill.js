//
// mod_Roland_mill.js
//   fab modules Roland mill output
//   currently only MDX-20
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

var label = document.getElementById("mod_inputs_label")
var input = label.innerHTML
if (input == "path (.svg)") {
   //
   // vector input processes
   //
   }
else {
   //
   // raster input processes
   //
   mod_add_process([
      ["name","PCB traces (1/64)"],
      ["module","Roland_mill"],
      ["controls","mod_path_image_21D_controls"],
      ["routine","mod_Roland_MDX_20_path"],
      ["command","mod_serial.py /dev/ttyUSB0 9600 dsrdtr"],
      ["depth","0.1"],
      ["diameter","0.4"],
      ["offsets","4"],
      ["overlap","50"],
      ["error","1.1"],
      ["merge","1.5"],
      ])
   mod_add_process([
      ["name","PCB outline (1/32)"],
      ["module","Roland_mill"],
      ["controls","mod_path_image_22D_controls"],
      ["routine","mod_Roland_MDX_20_path"],
      ["command","mod_serial.py /dev/ttyUSB0 9600 dsrdtr"],
      ["depth","0.6"],
      ["thickness","1.7"],
      ["diameter","0.79"],
      ["offsets","1"],
      ["error","1.1"],
      ["merge","1.5"],
      ])   
   mod_add_process([
      ["name","PCB traces (0.010)"],
      ["module","Roland_mill"],
      ["controls","mod_path_image_21D_controls"],
      ["routine","mod_Roland_MDX_20_path"],
      ["command","mod_serial.py /dev/ttyUSB0 9600 dsrdtr"],
      ["depth","0.1"],
      ["diameter","0.254"],
      ["offsets","1"],
      ["overlap","50"],
      ["error","1.1"],
      ["merge","1.5"],
      ])
   mod_add_process([
      ["name","wax rough cut (1/8)"],
      ["module","Roland_mill"],
      ["controls","mod_path_image_25D_controls"],
      ["routine","mod_Roland_MDX_20_path"],
      ["command","mod_serial.py /dev/ttyUSB0 9600 dsrdtr"],
      ["speed","20"],
      ["depth","1"],
      ["diameter","3.175"],
      ["overlap","50"],
      ["offsets","-1"],
      ["error","1.5"],
      ["merge","1.5"],
      ])   
   mod_add_process([
      ["name","wax finish cut (1/8)"],
      ["module","Roland_mill"],
      ["controls","mod_path_image_3D_controls"],
      ["routine","mod_Roland_MDX_20_path"],
      ["command","mod_serial.py /dev/ttyUSB0 9600 dsrdtr"],
      ["speed","20"],
      ["diameter","3.175"],
      ["length","25.4"],
      ["overlap","50"],
      ["error","1.5"],
      ])
   }
//
// mod_load_handler
//   file load handler
//
function mod_load_handler() {
   document.mod.output = "Roland_mill"
   mod_ui_prompt("process?")
   var controls = document.getElementById("mod_output_controls")
   controls.innerHTML = "<br><b>output</b>"
   controls.innerHTML += "<br>speed (mm/s):"
   controls.innerHTML += "&nbsp;<input type='text' id='mod_speed' size='3' value='4'>"
   controls.innerHTML += "<br>jog height (mm):"
   controls.innerHTML += "&nbsp;<input type='text' id='mod_jog' size='3' value='1'>"
   controls.innerHTML += "<br>xmin (mm):"
   controls.innerHTML += "&nbsp;<input type='text' id='mod_xmin' size='3' value='20' oninput=\
      'document.mod.xmin=document.getElementById(\"mod_xmin\").value'>"
   if (document.mod.xmin != "")
      document.getElementById("mod_xmin").setAttribute("value",document.mod.xmin)
   controls.innerHTML += "<br>ymin (mm):"
   controls.innerHTML += "&nbsp;<input type='text' id='mod_ymin' size='3' value='20' oninput=\
      'document.mod.ymin=document.getElementById(\"mod_ymin\").value'>"
   if (document.mod.ymin != "")
      document.getElementById("mod_ymin").setAttribute("value",document.mod.ymin)
   controls.innerHTML += "<br><input type='button' id='mod_move' value='move to xmin,ymin'\
      onclick='{\
         var name = \"move.rml\";\
         var xmin = 40*parseFloat(document.getElementById(\"mod_xmin\").value);\
         var ymin = 40*parseFloat(document.getElementById(\"mod_ymin\").value);\
         var file = \"PA;PA;!VZ10;!PZ0,100;PU \"+xmin+\" \"+ymin+\";PD \"+xmin+\" \"+ymin+\";!MC0;\";\
         var command = document.getElementById(\"mod_command\").value;\
         var server = document.getElementById(\"mod_server\").value;\
         mod_file_send(name,file,command,server);\
         }'>"
   controls.innerHTML += "<br><input type='button' id='mod_home' value='move home and stop'\
      onclick='{\
         var name = \"home.rml\";\
         var xmin = 40*parseFloat(document.getElementById(\"mod_xmin\").value);\
         var ymin = 40*parseFloat(document.getElementById(\"mod_ymin\").value);\
         var file = \"PA;PA;PU;H;\";\
         var command = document.getElementById(\"mod_command\").value;\
         var server = document.getElementById(\"mod_server\").value;\
         mod_file_send(name,file,command,server);\
         }'>"
   var label = document.getElementById("mod_processes_label")
   label.innerHTML ="process"
   label.style.display = "block"
   label.onclick = function (e) {
      mod_ui_clear()
      mod_ui_show_input()
      mod_ui_menu_process()
      }
   label.onmouseover = function (e) {
      this.style.background = highlight_background_color
      }
   label.onmouseout = function (e) {
      this.style.background = background_color
      }
   }
//
// mod_Roland_MDX_20_path
//    convert 3D path to RML
//
function mod_Roland_MDX_20_path(path) {
   document.mod.type = ".rml"
   var dx = 25.4*document.mod.width/document.mod.dpi
   var nx = document.mod.width
   var speed = parseFloat(document.getElementById("mod_speed").value)
   var jog = parseFloat(document.getElementById("mod_jog").value)
   var ijog = Math.floor(40*jog) // 40/mm
   var scale = 40.0*dx/(nx-1) // 40/mm
   var xmin = parseFloat(document.getElementById("mod_xmin").value)
   var ymin = parseFloat(document.getElementById("mod_ymin").value)
   var xoffset = 40.0*xmin // 40/mm
   var yoffset = 40.0*ymin // 40/mm
   var zoffset = 0
   var str = "PA;PA;" // plot absolute
   str += "VS"+speed+";!VZ"+speed+";"   
   str += "!PZ-"+0+","+ijog+";" // set jog 
   str +="!MC1;\n" // turn motor on
   //
   // follow segments
   //
   for (var seg = 0; seg < path.length; ++seg) {
      //
      // move up to starting point
      //
      x = xoffset + scale * path[seg][0][0]
      y = yoffset + scale * path[seg][0][1]
      str += "PU"+x.toFixed(0)+","+y.toFixed(0)+";\n"
      //
      // move down
      //
      z = zoffset + scale * path[seg][0][2]
      str += "Z"+x.toFixed(0)+","+y.toFixed(0)+","+z.toFixed(0)+";\n"
      for (var pt = 1; pt < path[seg].length; ++pt) {
         //
         // move to next point
         //
         x = xoffset + scale * path[seg][pt][0]
         y = yoffset + scale * path[seg][pt][1]
         z = zoffset + scale * path[seg][pt][2]
         str += "Z"+x.toFixed(0)+","+y.toFixed(0)+","+z.toFixed(0)+";\n"
         }
      //
      // move up
      //
      str += "PU"+x.toFixed(0)+","+y.toFixed(0)+";\n"
      }
   //
   // return to home
   //
   str += "H;\n"
   //
   // pad end of file with motor off commands for Modela buffering bug
   //
   //for (var i = 0; i < 1000; ++i)
   //for (var i = 0; i < 10; ++i)
   //   str += "!MC0;"
   //
   // return string
   //
   return str
   }

