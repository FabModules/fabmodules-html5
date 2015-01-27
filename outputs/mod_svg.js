//
// mod_svg.js
//   fab modules SVG output
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
      ["module","svg"],
      ["controls","mod_path_image_2D_controls"],
      ["routine","mod_svg_path"],
      ["command","inkscape"],
      ["diameter","0"],
      ["error","1"],
      ])   
   mod_add_process([
      ["name","offset"],
      ["module","svg"],
      ["controls","mod_path_image_2D_controls"],
      ["routine","mod_svg_path"],
      ["command","inkscape"],
      ["diameter","0.4"],
      ["error","1.1"],
      ])   
   mod_add_process([
      ["name","halftone"],
      ["module","svg"],
      ["controls","mod_path_image_halftone_controls"],
      ["routine","mod_svg_path"],
      ["command","inkscape"],
      ])
   }
//
// mod_load_handler
//   file load handler
//
function mod_load_handler() {
   document.mod.output = "svg"
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
// mod_svg_path
//    convert path to svg
//

function mod_svg_path(path) {
   document.mod.type = ".svg"
   var dx = 25.4*document.mod.width/document.mod.dpi
   var dy = 25.4*document.mod.height/document.mod.dpi
   var nx = document.mod.width
   var ny = document.mod.height
   var scale = dx/(nx-1)
      var str = '<?xml version="1.0" standalone="no"?>\n'
   str += '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN"\n'
   str += '  "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n'
   str += '<svg width="'+dx.toFixed(3)+'mm" height="'+dy.toFixed(3)+'mm" version="1.1"\n'
   str += '   viewBox="0 0 '+nx+' '+ny+'"\n'
   str += '   xmlns="http://www.w3.org/2000/svg">\n'
   for (var seg = 0; seg < path.length; ++ seg) {
      var x = path[seg][0][0]
      var y = ny - path[seg][0][1]
      str += '<polyline fill="none" stroke="black" stroke-width="1" points="'+x+','+y+'\n'
      for (var pt = 1; pt < path[seg].length; ++pt) {
         var x = path[seg][pt][0]
         var y = ny - path[seg][pt][1]
         str += x+','+y+' \n'
         }
      str += '"/>\n'
      }
   str += '</svg>\n'
   return str
   }

