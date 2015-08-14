//
// mod_GCC_laser.js
//   fab modules GCC lasercutter output
//
// Neil Gershenfeld 
// (c) Massachusetts Institute of Technology 2015
// 
// This work may be reproduced, modified, distributed, performed, and 
// displayed for any purpose, but must acknowledge the fab modules 
// project. Copyright is retained and must be preserved. The work is 
// provided as is; no warranty is provided, and users accept all 
// liability.
// esc \x1B 
define([
   'require',
   'handlebars',
   'mods/mod_ui',
   'mods/mod_globals',
   "text!templates/mod_gcc_laser_controls.html"],
function(require) {
   var ui = require('mods/mod_ui');
   var globals = require('mods/mod_globals');
   var Handlebars = require('handlebars');
   var mod_gcc_laser_controls_tpl = Handlebars.compile(require('text!templates/mod_gcc_laser_controls.html'))
   var findEl = globals.findEl
   var label = findEl("mod_inputs_label")
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
         ["name", "cut cardboard"],
         ["module", "GCC_laser"],
         ["controls", "mod_path_image_2D_controls"],
         ["routine", "mod_GCC_laser_path"],
         ["command", "lpr -Plaser"],
         ["diameter", "0.25"],
         ["power", "25"],
         ["speed", "75"],
         ])
      mod_add_process([
         ["name", "cut acrylic"],
         ["module", "GCC_laser"],
         ["controls", "mod_path_image_2D_controls"],
         ["routine", "mod_GCC_laser_path"],
         ["command", "lpr -Plaser"],
         ["diameter", "0.25"],
         ["power", "75"],
         ["speed", "75"],
         ])
      mod_add_process([
         ["name", "cut wood"],
         ["module", "GCC_laser"],
         ["controls", "mod_path_image_2D_controls"],
         ["routine", "mod_GCC_laser_path"],
         ["command", "lpr -Plaser"],
         ["diameter", "0.25"],
         ["power", "50"],
         ["speed", "75"],
         ])
      mod_add_process([
         ["name", "cut mylar"],
         ["module", "GCC_laser"],
         ["controls", "mod_path_image_2D_controls"],
         ["routine", "mod_GCC_laser_path"],
         ["command", "lpr -Plaser"],
         ["diameter", "0.25"],
         ["power", "10"],
         ["speed", "75"],
         ])
      mod_add_process([
         ["name", "halftone cardboard"],
         ["module", "GCC_laser"],
         ["controls", "mod_path_image_halftone_controls"],
         ["routine", "mod_GCC_laser_path"],
         ["command", "lpr -Plaser"],
         ["power", "15"],
         ["speed", "75"],
         ])
      mod_add_process([
         ["name", "halftone wood"],
         ["module", "GCC_laser"],
         ["controls", "mod_path_image_halftone_controls"],
         ["routine", "mod_GCC_laser_path"],
         ["command", "lpr -Plaser"],
         ["power", "20"],
         ["speed", "75"],
         ])
      mod_add_process([
         ["name", "halftone acrylic"],
         ["module", "GCC_laser"],
         ["controls", "mod_path_image_haltfone_controls"],
         ["routine", "mod_GCC_laser_path"],
         ["command", "lpr -Plaser"],
         ["power", "25"],
         ["speed", "75"],
         ])
      mod_add_process([
         ["name", "halftone mylar"],
         ["module", "GCC_laser"],
         ["controls", "mod_path_image_haltfone_controls"],
         ["routine", "mod_GCC_laser_path"],
         ["command", "lpr -Plaser"],
         ["power", "10"],
         ["speed", "75"],
         ])
      }
   //
   // mod_load_handler
   //   file load handler
   //
   function mod_load_handler() {
      globals.output = "GCC_laser"
      ui.ui_prompt("process?")
      var controls = findEl("mod_output_controls")
      controls.innerHTML = mod_gcc_laser_controls_tpl()
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
   // mod_GCC_laser_path
   //    convert path
   //
   function mod_GCC_laser_path(path) {
      globals.type = ".gcc"
      var dx = globals.width/globals.dpi
      var dy = globals.height/globals.dpi
      var nx = globals.width
      var ny = globals.height
      var ox = parseFloat(findEl("mod_x_origin").value)/25.4
      var oy = parseFloat(findEl("mod_y_origin").value)/25.4
      var scale = 1016*dx/(nx-1) // 1016 DPI
      if (findEl("mod_bottom_left").checked) {
         var xoffset = 1016*ox
         var yoffset = 1016*(oy-dy)
         }
      else if (findEl("mod_bottom_right").checked) {
         var xoffset = 1016*(ox-dx)
         var yoffset = 1016*(oy-dy)
         }
      else if (findEl("mod_top_left").checked) {
         var xoffset = 1016*ox
         var yoffset = 1016*oy
         }
      else if (findEl("mod_top_right").checked) {
         var xoffset = 1016*(ox-dx)
         var yoffset = 1016*oy
         }
      var str = "%-12345X" // start of job
      str += "E" // reset
      str += "!m"+globals.input_basename.length+"N"+globals.input_basename // file name
      // if (findEl("mod_autofocus").checked)
      //
      // init with autofocus on
      //
      //   str += ???
      // else
      // 
      // init with autofocus off
      //
      //   str += ???
      str += "!v16R" // Enable Pulse Per Inch for 16 pens, range 0-1
      str += "1111111111111111"
      var rate = parseFloat(findEl("mod_rate").value)
      str += "!v64I" // PPI for 16 pens, 0001-1524
      str += ("0000"+(rate.toFixed(0))).slice(-4)
      str += "050005000500050005000500050005000500050005000500050005000500"
      var speed = parseFloat(findEl("mod_speed").value)
      str += "!v64V" // velocity for 16 pens, 0500 = 50%
      str += ("0000"+((speed*10).toFixed(0))).slice(-4)
      str += "050005000500050005000500050005000500050005000500050005000500"
      var power = parseFloat(findEl("mod_power").value)
      str += "!v64P" // power for 16 pens, 0500 = 50%
      str += ("0000"+((power*10).toFixed(0))).slice(-4)
      str += "050005000500050005000500050005000500050005000500050005000500"
      str += "%1A" // PCL mode
      str += "*t1016R" // raster resolution 1016
      str += "&u1016D" // unit of measure 1016
      //str += "*p"+xoffset.toFixed(0)+"X" // start cursor X position
      //str += "*p"+yoffset.toFixed(0)+"Y" // start cursor Y position
      str += "*r1A" // move carriage to cursor
      str += "*rC" // close raster cluster
      str += "%1B;"   // HPGL mode
      //str += "PR;"   // plot relative
      str += "PA;"   // plot relative
      str += "SP1;" // pen 1
      //
      // loop over segments
      //
      for (var seg = 0; seg < path.length; ++seg) {
         //
         // loop over points
         //
         x = xoffset+scale*path[seg][0][0]
         y = yoffset+scale*(path[seg][0][1])
         if (x < 0) x = 0
         if (y < 0) y = 0
         str += "PU" + x.toFixed(0) + "," + y.toFixed(0) + ";" // move up to start point
         for (var pt = 1; pt < path[seg].length; ++pt) {
            x = xoffset+scale*path[seg][pt][0]
            y = yoffset+scale*(path[seg][pt][1])
            if (x < 0) x = 0
            if (y < 0) y = 0
            str += "PD" + x.toFixed(0) + "," + y.toFixed(0) + ";" // move down
            }
         }
      str += "%1A" // PCL mode
      str += "E" // reset
      str += "%-12345X" // end of job
      return str
      }
   return {
      mod_load_handler: mod_load_handler,
      mod_GCC_laser_path: mod_GCC_laser_path
      }
   })

