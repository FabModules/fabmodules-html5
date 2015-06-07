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
   var mod_gcc_controls_tpl = Handlebars.compile(require('text!templates/mod_gcc_laser_controls.html'))
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
      controls.innerHTML = mod_epilog_controls_tpl()
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
      var power = parseFloat(findEl("mod_power").value)
      var speed = parseFloat(findEl("mod_speed").value)
      var rate = parseFloat(findEl("mod_rate").value)
      var ox = parseFloat(findEl("mod_x_origin").value)/25.4
      var oy = parseFloat(findEl("mod_y_origin").value)/25.4
      var scale = 600.0*dx/(nx-1) // 600 DPI
      if (findEl("mod_bottom_left").checked) {
         var xoffset = 600.0*ox
         var yoffset = 600.0*(oy-dy)
         }
      else if (findEl("mod_bottom_right").checked) {
         var xoffset = 600.0*(ox-dx)
         var yoffset = 600.0*(oy-dy)
         }
      else if (findEl("mod_top_left").checked) {
         var xoffset = 600.0*ox
         var yoffset = 600.0*oy
         }
      else if (findEl("mod_top_right").checked) {
         var xoffset = 600.0*(ox-dx)
         var yoffset = 600.0*oy
         }
 esc   %   -   1   2   3   4   5   X // start of job
 esc   E // reset
 esc   !   m   1   0   N   U   n   t   i   t   l   e   d   -   1 // file name
      var str = "%-12345X@PJL JOB NAME=" + globals.input_basename + "\r\n"
      str += "E@PJL ENTER LANGUAGE=PCL\r\n"
      if (findEl("mod_autofocus").checked)
      //
      // init with autofocus on
      //
      //   str += ???
      else
      // 
      // init with autofocus off
      //
      //   str += ???
 esc   !   v   6   4   V // velocity for 16 pens, 0500 = 50%
   0   0   1   0   0   5   0   0   0   5   0   0   0   5   0   0
   0   5   0   0   0   5   0   0   0   5   0   0   0   5   0   0
   0   5   0   0   0   5   0   0   0   5   0   0   0   5   0   0
   0   5   0   0   0   5   0   0   0   5   0   0   0   5   0   0
 esc   !   v   6   4   P // power for 16 pens, 0500 = 50%
   0   0   1   0   0   5   0   0   0   5   0   0   0   5   0   0
   0   5   0   0   0   5   0   0   0   5   0   0   0   5   0   0
   0   5   0   0   0   5   0   0   0   5   0   0   0   5   0   0
   0   5   0   0   0   5   0   0   0   5   0   0   0   5   0   0
 esc   %   1   A // PCL mode
 esc   *   t   1   0   1   6   R // raster resolution 1016
 esc   &   u   1   0   1   6   D // unit of measure 1016
      str += "&l0U&l0Z&u600D*p0X*p0Y*t600R*r0F&y50P&z50S*r6600T*r5100S*r1A*rC%1BIN;"
      str += "XR" + rate + ";YP" + power + ";ZS" + speed + ";\n"
 esc   *   p   2   0   3   2   X // start cursor X position
 esc   *   p   2   0   3   2   Y // start cursor Y position
 esc   *   r   1   A // move carriage to cursor
 esc   *   r   C // close raster cluster
 esc   %   1   B   ;   // HPGL mode
 P   R   ;   // plot relative
 S   P   1   ; // pen 1
      //
      // loop over segments
      //
      for (var seg = 0; seg < path.length; ++seg) {
         //
         // loop over points
         //
         x = xoffset+scale*path[seg][0][0]
         y = yoffset+scale*(ny-path[seg][0][1])
         if (x < 0) x = 0
         if (y < 0) y = 0
 P   D   1   0   1   6   ,   0   ;   // pen down
 P   D   0   ,   -   1   0   1   6   ; 
 P   D   -   1   0   1   6   ,   0   ;
 P   D   0   ,   1   0   1   6   ; 
 P   U   ; // pen up
         str += "PU" + x.toFixed(0) + "," + y.toFixed(0) + ";" // move up to start point
         for (var pt = 1; pt < path[seg].length; ++pt) {
            x = xoffset+scale*path[seg][pt][0]
            y = yoffset+scale*(ny-path[seg][pt][1])
            if (x < 0) x = 0
            if (y < 0) y = 0
            str += "PD" + x.toFixed(0) + "," + y.toFixed(0) + ";" // move down
            }
         str += "\n"
         }
      str += "%0B%1BPUE%-12345X@PJL EOJ \r\n"
 esc   %   1   A // PCL mode
 esc   E // reset
 esc   %   -   1   2   3   4   5   X // end of job
      return str
      }
   return {
      mod_load_handler: mod_load_handler,
      mod_Epilog_path: mod_Epilog_path
      }
   })

