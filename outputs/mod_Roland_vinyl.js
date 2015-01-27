//
// mod_Roland_vinyl.js
//   fab modules vinylcutter output
//   currently only GX-24
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
      ["name","cut vinyl"],
      ["module","Roland_vinyl"],
      ["controls","mod_path_image_2D_controls"],
      ["routine","mod_Roland_GX_24_path"],
      ["command","lpr -Pvinyl"],
      ["diameter","0.25"],
      ["force","45"],
      ["velocity","2"],
      ])   
   mod_add_process([
      ["name","cut epoxy"],
      ["module","Roland_vinyl"],
      ["controls","mod_path_image_2D_controls"],
      ["routine","mod_Roland_GX_24_path"],
      ["command","lpr -Pvinyl"],
      ["diameter","0.25"],
      ["force","75"],
      ["velocity","2"],
      ])   
   mod_add_process([
      ["name","cut copper"],
      ["module","Roland_vinyl"],
      ["controls","mod_path_image_2D_controls"],
      ["routine","mod_Roland_GX_24_path"],
      ["command","lpr -Pvinyl"],
      ["diameter","0.25"],
      ["force","60"],
      ["velocity","2"],
      ])
   }
//
// mod_load_handler
//   file load handler
//
function mod_load_handler() {
   document.mod.output = "Roland_vinyl"
   mod_ui_prompt("process?")
   var controls = document.getElementById("mod_output_controls")
   controls.innerHTML = "<br><b>output</b>"
   controls.innerHTML += "<br>force (g):"
   controls.innerHTML += "&nbsp;<input type='text' id='mod_force' size='3' value='45'>"
   controls.innerHTML += "<br>velocity (cm/s):"
   controls.innerHTML += "&nbsp;<input type='text' id='mod_velocity' size='3' value='2'>"
   controls.innerHTML += "<br>origin:"
   controls.innerHTML += "<br><input type='radio' name='origin' id='mod_top_left'> left top right <input type='radio' name='origin' id='mod_top_right'>"
   controls.innerHTML += "<br><input type='radio' name='origin' id='mod_bottom_left' checked> left bot right <input type='radio' name='origin' id='mod_bottom_right'>"
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
// mod_Roland_GX_24_path
//    convert path
//
function mod_Roland_GX_24_path(path) {
   document.mod.type = ".camm"
   var dx = 25.4*document.mod.width/document.mod.dpi
   var dy = 25.4*document.mod.height/document.mod.dpi
   var nx = document.mod.width
   var ny = document.mod.height
   var force = parseFloat(document.getElementById("mod_force").value)
   var velocity = parseFloat(document.getElementById("mod_velocity").value)
   var str = "PA;PA;!ST1;!FS"+force+";VS"+velocity+";\n"
   var scale = 40.0*dx/(nx-1.0) // 40/mm
   var ox = 0
   var oy = 0
   if (document.getElementById("mod_bottom_left").checked) {
      var xoffset = 40.0*ox
      var yoffset = 40.0*oy
      }
   else if (document.getElementById("mod_bottom_right").checked) {
      var xoffset = 40.0*(ox-dx)
      var yoffset = 40.0*oy
      }
   else if (document.getElementById("mod_top_left").checked) {
      var xoffset = 40.0*ox
      var yoffset = 40.0*(oy-dy)
      }
   else if (document.getElementById("mod_top_right").checked) {
      var xoffset = 40.0*(ox-dx)
      var yoffset = 40.0*(oy-dy)
      }
   //
   // loop over segments
   //
   for (var seg = 0; seg < path.length; ++ seg) {
      x = xoffset + scale * path[seg][0][0]
      y = yoffset + scale * path[seg][0][1]
      str += "PU"+x.toFixed(0)+","+y.toFixed(0)+";\n" // move up to start point
      str += "PU"+x.toFixed(0)+","+y.toFixed(0)+";\n" // hack: repeat in case comm dropped
      str += "PD"+x.toFixed(0)+","+y.toFixed(0)+";\n" // move down
      str += "PD"+x.toFixed(0)+","+y.toFixed(0)+";\n" // hack: repeat in case comm dropped
      //
      // loop over points
      //
      for (var pt = 1; pt < path[seg].length; ++pt) {
         x = xoffset + scale * path[seg][pt][0]
         y = yoffset + scale * path[seg][pt][1]
         str += "PD"+x.toFixed(0)+","+y.toFixed(0)+";\n" // move down
         str += "PD"+x.toFixed(0)+","+y.toFixed(0)+";\n" // hack: repeat in case comm dropped
         }
      str += "PU"+x.toFixed(0)+","+y.toFixed(0)+";\n" // move up at last point
      str += "PU"+x.toFixed(0)+","+y.toFixed(0)+";\n" // hack: repeat in case comm dropped
      }
   str += "PU0,0;\n" // pen up to origin
   str += "PU0,0;\n" // hack: repeat in case comm dropped
   return str
   }

