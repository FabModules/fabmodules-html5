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

define(['require',
   'handlebars',
   'text!templates/mod_roland_vinyl_controls.html',
   'mods/mod_ui',
   'mods/mod_globals'
], function(require) {

   var ui = require('mods/mod_ui');
   var globals = require('mods/mod_globals');
   var Handlebars = require('handlebars');
   var findEl = globals.findEl
   var mod_roland_vinyl_controls_tpl = Handlebars.compile(require('text!templates/mod_roland_vinyl_controls.html'))
   var label = findEl("mod_inputs_label")
   var input = label.innerHTML
   if (input == "path (.svg)") {
      //
      // vector input processes
      //
   } else {
      //
      // raster input processes
      //
      mod_add_process([
         ["name", "cut vinyl"],
         ["module", "Roland_vinyl"],
         ["controls", "mod_path_image_2D_controls"],
         ["routine", "mod_Roland_GX_24_path"],
         ["command", "lpr -Pvinyl"],
         ["diameter", "0.25"],
         ["force", "45"],
         ["velocity", "2"],
      ])
      mod_add_process([
         ["name", "cut epoxy"],
         ["module", "Roland_vinyl"],
         ["controls", "mod_path_image_2D_controls"],
         ["routine", "mod_Roland_GX_24_path"],
         ["command", "lpr -Pvinyl"],
         ["diameter", "0.25"],
         ["force", "75"],
         ["velocity", "2"],
      ])
      mod_add_process([
         ["name", "cut copper"],
         ["module", "Roland_vinyl"],
         ["controls", "mod_path_image_2D_controls"],
         ["routine", "mod_Roland_GX_24_path"],
         ["command", "lpr -Pvinyl"],
         ["diameter", "0.25"],
         ["force", "60"],
         ["velocity", "2"],
      ])
   }
   //
   // mod_load_handler
   //   file load handler
   //

   function mod_load_handler() {
      globals.output = "Roland_vinyl"
      ui.ui_prompt("process?")
      var controls = findEl("mod_output_controls")
      controls.innerHTML = mod_roland_vinyl_controls_tpl()
      var label = findEl("mod_processes_label")
      label.innerHTML = "process"
      label.style.display = "block"
      label.onclick = function(e) {
         ui.ui_clear()
         ui.ui_show_input()
         ui.ui_menu_process()
      }
      label.onmouseover = function(e) {
         this.style.background = ui.defaults.highlight_background_color
      }
      label.onmouseout = function(e) {
         this.style.background = ui.defaults.background_color
      }
   }
   //
   // mod_Roland_GX_24_path
   //    convert path
   //

   function mod_Roland_GX_24_path(path) {
      globals.type = ".camm"
      var dx = 25.4 * globals.width / globals.dpi
      var dy = 25.4 * globals.height / globals.dpi
      var nx = globals.width
      var ny = globals.height
      var force = parseFloat(findEl("mod_force").value)
      var velocity = parseFloat(findEl("mod_velocity").value)
      var str = "PA;PA;!ST1;!FS" + force + ";VS" + velocity + ";\n"
      var scale = 40.0 * dx / (nx - 1.0) // 40/mm
      var ox = 0
      var oy = 0
      if (findEl("mod_bottom_left").checked) {
         var xoffset = 40.0 * ox
         var yoffset = 40.0 * oy
      } else if (findEl("mod_bottom_right").checked) {
         var xoffset = 40.0 * (ox - dx)
         var yoffset = 40.0 * oy
      } else if (findEl("mod_top_left").checked) {
         var xoffset = 40.0 * ox
         var yoffset = 40.0 * (oy - dy)
      } else if (findEl("mod_top_right").checked) {
         var xoffset = 40.0 * (ox - dx)
         var yoffset = 40.0 * (oy - dy)
      }
      //
      // loop over segments
      //
      for (var seg = 0; seg < path.length; ++seg) {
         x = xoffset + scale * path[seg][0][0]
         y = yoffset + scale * path[seg][0][1]
         str += "PU" + x.toFixed(0) + "," + y.toFixed(0) + ";\n" // move up to start point
         str += "PU" + x.toFixed(0) + "," + y.toFixed(0) + ";\n" // hack: repeat in case comm dropped
         str += "PD" + x.toFixed(0) + "," + y.toFixed(0) + ";\n" // move down
         str += "PD" + x.toFixed(0) + "," + y.toFixed(0) + ";\n" // hack: repeat in case comm dropped
         //
         // loop over points
         //
         for (var pt = 1; pt < path[seg].length; ++pt) {
            x = xoffset + scale * path[seg][pt][0]
            y = yoffset + scale * path[seg][pt][1]
            str += "PD" + x.toFixed(0) + "," + y.toFixed(0) + ";\n" // move down
            str += "PD" + x.toFixed(0) + "," + y.toFixed(0) + ";\n" // hack: repeat in case comm dropped
         }
         str += "PU" + x.toFixed(0) + "," + y.toFixed(0) + ";\n" // move up at last point
         str += "PU" + x.toFixed(0) + "," + y.toFixed(0) + ";\n" // hack: repeat in case comm dropped
      }
      str += "PU0,0;\n" // pen up to origin
      str += "PU0,0;\n" // hack: repeat in case comm dropped
      return str
   }

   return {
      mod_load_handler: mod_load_handler,
      mod_Roland_GX_24_path: mod_Roland_GX_24_path
   }

});
