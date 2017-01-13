//
// mod_G.js
//   fab modules G-code output
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

define(['require', 'handlebars', 'mods/mod_ui', 'mods/mod_globals', 'text!templates/mod_og_controls.html'], function(require) {

   var ui = require('mods/mod_ui');
   var globals = require('mods/mod_globals');
   var Handlebars = require('handlebars')
   var mod_g_controls_tpl = Handlebars.compile(require('text!templates/mod_og_controls.html'))
   var findEl = globals.findEl

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
         ["name", "7/16 plywood (1/8 mill)"],
         ["module", "Octo_G"],
         ["controls", "mod_path_image_22D_controls"],
         ["routine", "mod_OG_path"],
         ["command", "gedit"],
         ["diameter", "3.175"],
         ["cut_speed", "50"],
         ["plunge_speed", "25"],
         ["offsets", "1"],
         ["overlap", "0"],
         ["error", "1.1"],
         ["merge", "1.5"],
         ["depth", "3.175"],
         ["thickness", "11.11"],
      ])
      mod_add_process([
         ["name", "1/2 HDPE (1/8 mill)"],
         ["module", "Octo_G"],
         ["controls", "mod_path_image_22D_controls"],
         ["routine", "mod_OG_path"],
         ["command", "gedit"],
         ["diameter", "3.175"],
         ["cut_speed", "10"],
         ["plunge_speed", "5"],
         ["offsets", "1"],
         ["overlap", "0"],
         ["error", "1.1"],
         ["merge", "1.5"],
         ["depth", "3.175"],
         ["thickness", "12.7"],
      ])
      mod_add_process([
         ["name", "foam rough cut (1/8)"],
         ["module", "Octo_G"],
         ["controls", "mod_path_image_25D_controls"],
         ["routine", "mod_OG_path"],
         ["command", "gedit"],
         ["cut_speed", "50"],
         ["plunge_speed", "25"],
         ["depth", "3.175"],
         ["diameter", "3.175"],
         ["overlap", "50"],
         ["offsets", "-1"],
         ["error", "1.1"],
         ["merge", "1.5"],
      ])
      mod_add_process([
         ["name", "foam finish cut (1/8)"],
         ["module", "Octo_G"],
         ["controls", "mod_path_image_3D_controls"],
         ["routine", "mod_OG_path"],
         ["command", "gedit"],
         ["cut_speed", "50"],
         ["plunge_speed", "25"],
         ["diameter", "3.175"],
         ["length", "25.4"],
         ["overlap", "90"],
         ["error", "1.1"],
      ])
      mod_add_process([
         ["name", "PCB traces (1/64)"],
         ["module", "Octo_G"],
         ["controls", "mod_path_image_21D_controls"],
         ["routine", "mod_OG_path"],
         ["command", "gedit"],
         ["cut_speed", "4.9"],
         ["plunge_speed", "2"],
         ["depth", "0.1"],
         ["diameter", "0.4"],
         ["offsets", "4"],
         ["overlap", "50"],
         ["error", "1.1"],
         ["merge", "1.5"],
      ])
      mod_add_process([
         ["name", "PCB outline (1/32)"],
         ["module", "Octo_G"],
         ["controls", "mod_path_image_22D_controls"],
         ["routine", "mod_OG_path"],
         ["command", "gedit"],
         ["cut_speed", "4.9"],
         ["plunge_speed", "2"],
         ["depth", "0.6"],
         ["thickness", "1.7"],
         ["diameter", "0.79"],
         ["offsets", "1"],
         ["error", "1.1"],
         ["merge", "1.5"],
      ])
      mod_add_process([
         ["name", "PCB traces (0.010)"],
         ["module", "Octo_G"],
         ["controls", "mod_path_image_21D_controls"],
         ["routine", "mod_OG_path"],
         ["command", "gedit"],
         ["cut_speed", "2.4"],
         ["plunge_speed", "1"],
         ["depth", "0.1"],
         ["diameter", "0.254"],
         ["offsets", "1"],
         ["overlap", "50"],
         ["error", "1.1"],
         ["merge", "1.5"],
      ])
   }
   //
   // mod_load_handler
   //   file load handler
   //

   function mod_load_handler() {
      globals.output = "Octo_G"
      ui.ui_prompt("process?")
      var controls = findEl("mod_output_controls")
      controls.innerHTML = mod_g_controls_tpl();
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
   // mod_OG_path
   //    convert path to octoprint compatible G code
   //

   function mod_OG_path(path) {
      globals.type = ".gcode"
      var dx = globals.width / globals.dpi
      var nx = globals.width
      var cut_speed = 60 * parseFloat(findEl("mod_cut_speed").value)
      var plunge_speed = 60 * parseFloat(findEl("mod_plunge_speed").value)
      var jog_speed = 60 * parseFloat(findEl("mod_jog_speed").value)
      var jog_height = parseFloat(findEl("mod_jog_height").value)
      var scale = dx / (nx - 1)
      var xoffset = parseFloat(findEl("mod_x_offset").value)
      var yoffset = parseFloat(findEl("mod_y_offset").value)
      var zoffset = parseFloat(findEl("mod_z_offset").value)
      // Clear all state: XY plane, inch mode, cancel diameter compensation, cancel length offset
      // coordinate system 1, cancel motion, non-incremental motion, feed/minute mode
      str  = "G1 F" + jog_speed.toFixed(0) + " Z" + jog_height.toFixed(4) + "\n"
      str += "M280 S-90 P0 F3000 R\n" // turn off spindle (quadcoper rotor safety lockout)
      str += "G4 S1\n"
      str += "M280 S90 P0 F3000 R\n" // turn on spindle at full power
      str += "G4 S2\n" // give spindle 1 second to spin up
      //
      // follow segments
      //
      for (var seg = 0; seg < path.length; ++seg) {
         var x = xoffset + scale * path[seg][0][0] * 25.4
         var y = yoffset + scale * path[seg][0][1] * 25.4
         var z = zoffset + scale * path[seg][0][2] * 25.4
         //
         // move up to starting point
         //
         str += "G0 Z" + jog_height.toFixed(4) + "\n"
         str += "G0 F" + jog_speed.toFixed(0) + " X" + x.toFixed(4) + " Y" + y.toFixed(4) + " Z" + jog_height.toFixed(4) + "\n"
         //
         // move down
         //
         str += "G1 F" + plunge_speed.toFixed(0) + " Z" + z.toFixed(4) + "\n"
         for (var pt = 1; pt < path[seg].length; ++pt) {
            //
            // move to next point
            //
            x = xoffset + scale * path[seg][pt][0] * 25.4
            y = yoffset + scale * path[seg][pt][1] * 25.4
            z = zoffset + scale * path[seg][pt][2] * 25.4
            str += "G1 F" + cut_speed.toFixed(0) + " X" + x.toFixed(4) + " Y" + y.toFixed(4) + " Z" + z.toFixed(4) + "\n"
         }
      }
      //
      // finish
      //
      str += "G0 Z" + jog_height.toFixed(4) + "\n" // move up before stopping spindle
      str += "G4 S1\n" // wait one second before turnign off spindle to prevent too eager turnoff
      str += "M280 S-90 P0 F3000 R\n" // turn off spindle
      //
      // return string
      //
      return str
   }

   return {
      mod_load_handler: mod_load_handler,
      mod_OG_path: mod_OG_path
   }

});
