//
// mod_eps.js
//   fab modules Postscript output
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
      ["name","outline"],
      ["module","eps"],
      ["controls","mod_path_image_2D_controls"],
      ["routine","mod_eps_path"],
      ["command","gv"],
      ["diameter","0"],
      ["error","1"],
      ])
   mod_add_process([
      ["name","offset"],
      ["module","eps"],
      ["controls","mod_path_image_2D_controls"],
      ["routine","mod_eps_path"],
      ["command","gv"],
      ["diameter","0.4"],
      ["error","1.1"],
      ])
   mod_add_process([
      ["name","halftone"],
      ["module","eps"],
      ["controls","mod_path_image_halftone_controls"],
      ["routine","mod_eps_path"],
      ["command","gv"],
      ])
   }   
//
// mod_load_handler
//   file load handler
//
function mod_load_handler() {
   document.mod.output = "eps"
   mod_ui_prompt("process?")
   var controls = document.getElementById("mod_output_controls")
   controls.innerHTML = ""
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
// mod_eps_path
//    convert path to eps
//
function mod_eps_path(path) {
   document.mod.type = ".eps"
   var margin = 0.5
   var str = "%! path_eps output\n"
   var dx = document.mod.width/document.mod.dpi
   var dy = document.mod.height/document.mod.dpi
   var nx = document.mod.width
   str += "%%BoundingBox: "+72.0*margin+" "+72.0*margin+" "+72.0*(margin+dx)+" "+72.0*(margin+dy)+"\n"
   str += "/m {moveto} def\n"
   str += "/l {lineto} def\n"
   str += "/g {setgray} def\n"
   str += "/s {stroke} def\n"
   str += "72 72 scale\n"
   str += margin+" "+margin+" translate\n"
   str += "1 setlinewidth\n"
   var scale = dx/(nx-1)
   str += scale+" "+scale+" scale\n"
   for (var seg = 0; seg < path.length; ++ seg) {
      str += path[seg][0][0]+" "+path[seg][0][1]+" m\n"
      for (var pt = 1; pt < path[seg].length; ++pt) {
         str += path[seg][pt][0]+" "+path[seg][pt][1]+" l\n"
         }
      str += "s\n"
      }
   return str
   }

