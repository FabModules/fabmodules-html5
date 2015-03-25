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

define(['require', 'handlebars', 'mods/mod_ui', 'mods/mod_globals', 'text!templates/mod_g_controls.html'], function(require) {

   var ui = require('mods/mod_ui');
   var globals = require('mods/mod_globals');
   var Handlebars = require('handlebars')
   var mod_g_controls_tpl = Handlebars.compile(require('text!templates/mod_g_controls.html'))
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
         ["name", "12mm plywood"],
         ["module", "Smoothie_G"],
         ["controls", "mod_path_image_22D_controls"],
         ["routine", "mod_SmG_path"],
         ["command", "gedit"],
         ["diameter", "3"],
         ["cut_speed", "8"],
         ["plunge_speed", "25"],
         ["spindle_speed", "24000"],
         ["offsets", "1"],
         ["overlap", "0"],
         ["error", "1.5"],
         ["merge", "1.5"],
         ["depth", "6.2"],
         ["thickness", "12"],
      ])
      mod_add_process([
         ["name", "1/2 HDPE (1/8 mill)"],
         ["module", "Smoothie_G"],
         ["controls", "mod_path_image_22D_controls"],
         ["routine", "mod_SmG_path"],
         ["command", "gedit"],
         ["diameter", "3.175"],
         ["cut_speed", "10"],
         ["plunge_speed", "5"],
         ["spindle_speed", "10000"],
         ["offsets", "1"],
         ["overlap", "0"],
         ["error", "1.5"],
         ["merge", "1.5"],
         ["depth", "3.175"],
         ["thickness", "12.7"],
      ])
      mod_add_process([
         ["name", "foam rough cut (1/8)"],
         ["module", "Smoothie_G"],
         ["controls", "mod_path_image_25D_controls"],
         ["routine", "mod_SmG_path"],
         ["command", "gedit"],
         ["cut_speed", "50"],
         ["plunge_speed", "25"],
         ["spindle_speed", "10000"],
         ["depth", "3.175"],
         ["diameter", "3.175"],
         ["overlap", "50"],
         ["offsets", "-1"],
         ["error", "1.5"],
         ["merge", "1.5"],
      ])
      mod_add_process([
         ["name", "foam finish cut (1/8)"],
         ["module", "Smoothie_G"],
         ["controls", "mod_path_image_3D_controls"],
         ["routine", "mod_SmG_path"],
         ["command", "gedit"],
         ["cut_speed", "50"],
         ["plunge_speed", "25"],
         ["spindle_speed", "10000"],
         ["diameter", "3.175"],
         ["length", "25.4"],
         ["overlap", "50"],
         ["error", "1.5"],
      ])
   }
   //
   // mod_load_handler
   //   file load handler
   //

   function mod_load_handler() {
      globals.output = "Smoothie_G"
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
   // mod_G_path
   //    convert path to G code
   //

   function mod_SmG_path(path) {
      globals.type = ".gcode"
      var dx = globals.width / globals.dpi
      var nx = globals.width
      var cut_speed = 60 * parseFloat(findEl("mod_cut_speed").value) 
      var plunge_speed = 60 * parseFloat(findEl("mod_plunge_speed").value) 
      var jog_height = parseFloat(findEl("mod_jog_height").value) 
      var spindle_speed = parseFloat(findEl("mod_spindle_speed").value)*255/24000
      var tool = findEl("mod_tool").value
      var scale = (dx / (nx - 1))*25.400 //metric
      var xoffset = 0
      var yoffset = 0
      var zoffset = 0
      str = ";G-gode for Smoothieboard/sentierBattu\n" // tape start
      // Clear all state: XY plane, inch mode, cancel diameter compensation, cancel length offset
      // coordinate system 1, cancel motion, non-incremental motion, feed/minute mode
      str += "G17\n" //select XYZ plane
      str += "G21\n" //milimeters
      str += "G90\n" //absolute mode
      str += "T" + tool + "M06\n" // tool selection, tool change
      str += "F" + cut_speed.toFixed(4) + "\n" // feed rate
      str += "S" + spindle_speed + "\n" // spindle speed
      if (findEl("mod_coolant_on").checked)
         str += "M08\n" // coolant on
      str += "G00Z" + jog_height.toFixed(4) + "\n" // move up before starting spindle
      str += "M03 F" + spindle_speed + "\n"  // spindle on clockwise// feed rate
      str += "G04 S5\n" // give spindle 5 second to spin up
      //
      // follow segments
      //
      for (var seg = 0; seg < path.length; ++seg) {
         var x = xoffset + scale * path[seg][0][0]
         var y = yoffset + scale * path[seg][0][1]
         var z = zoffset + scale * path[seg][0][2]
         //
         // move up to starting point
         //
         str += "Z" + jog_height.toFixed(4) + "\n"
         str += "G00X" + x.toFixed(4) + "Y" + y.toFixed(4) + "Z" + jog_height.toFixed(4) + "\n"
         //
         // move down
         //
         str += "G01Z" + z.toFixed(4) + " F" + plunge_speed.toFixed(4) + "\n"
         str += "F" + cut_speed.toFixed(4) + "\n" //restore XY feed rate
         for (var pt = 1; pt < path[seg].length; ++pt) {
            //
            // move to next point
            //
            x = xoffset + scale * path[seg][pt][0]
            y = yoffset + scale * path[seg][pt][1]
            z = zoffset + scale * path[seg][pt][2]
            str += "G01X" + x.toFixed(4) + "Y" + y.toFixed(4) + "Z" + z.toFixed(4) + "\n"
         }
      }
      //
      // finish
      //
      str += "G00Z" + jog_height.toFixed(4) + "\n" // move up before stopping spindle
      str += "M05\n" // spindle stop
      if (findEl("mod_coolant_on").checked)
         str += "M09\n" // coolant off
      str += "M30\n" // program end and reset

      //
      // return string
      //
      return str
   }

   return {
      mod_load_handler: mod_load_handler,
      mod_SmG_path: mod_SmG_path
   }

});
