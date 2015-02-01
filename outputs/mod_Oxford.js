//
// mod_Oxford.js
//   fab modules Oxford laser micromachining output
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

define(['require', 'handlebars', 'mods/mod_ui', 'mods/mod_globals', 'text!templates/mod_oxford_controls.html'], function(require) {

   var ui = require('mods/mod_ui');
   var Handlebars = require('handlebars');
   var globals = require('mods/mod_globals');
   var mod_oxford_controls_tpl = Handlebars.compile(require('text!templates/mod_oxford_controls.html'))
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
         ["name", "outline"],
         ["module", "Oxford"],
         ["controls", "mod_path_image_22D_controls"],
         ["routine", "mod_Oxford_path"],
         ["command", "gedit"],
         ["diameter", "0"],
         ["error", "1"],
         ["multiple", "1.5"],
         ["depth", "1"],
         ["thickness", "1"],
         ["feed", "3"],
         ["jog", "10"]
      ])
      mod_add_process([
         ["name", "offset"],
         ["module", "Oxford"],
         ["controls", "mod_path_image_22D_controls"],
         ["routine", "mod_Oxford_path"],
         ["command", "gedit"],
         ["diameter", "0.02"],
         ["error", "1"],
         ["multiple", "1.5"],
         ["depth", "1"],
         ["thickness", "1"],
         ["feed", "3"],
         ["jog", "10"]
      ])
   }

   //
   // mod_load_handler
   //   file load handler
   //

   function mod_load_handler() {
      globals.output = "Oxford"
      ui.ui_prompt("process?")
      var controls = findEl("mod_output_controls")
      controls.innerHTML = mod_oxford_controls_tpl()
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
   // mod_Oxford_path
   //    convert path to Oxford .pgm
   //

   function mod_Oxford_path(path) {
      globals.type = ".pgm"
      var power = parseFloat(findEl("mod_power").value)
      var feed = parseFloat(findEl("mod_feed").value)
      var jog = parseFloat(findEl("mod_jog").value)
      str = "; fab modules output\r\n"
      str += "; " + globals.input_basename + globals.type + "\r\n"
      str += "G90\r\n" // absolute coordinate mode
      str += "G71\r\n" // mm units, mm/s velocity
      str += "G92 X0 Y0\r\n" // software home
      str += "G108\r\n" // no deceleration to zero velocity; todo: make option
      str += "BEAMOFF\r\n"
      str += "FARCALL \"ATTENUATOR.PGM\" s" + power + "\r\n"
      str += "MSGCLEAR -1\r\n"
      str += "MSGDISPLAY 1, \"Program Started\"\r\n"
      //str += "MSGDISPLAY 1, "{#F3 #F}" "Time is #TS"\r\n"
      //str += "OPENSHUTTER\r\n"
      var dx = 25.4 * (globals.width / globals.dpi)
      var nx = globals.width
      var scale = dx / (nx - 1)
      var xoffset = 0
      var yoffset = 0
      var zoffset = 0
      //
      // follow segments
      //
      for (var seg = 0; seg < path.length; ++seg) {
         var x = xoffset + scale * path[seg][0][0]
         var y = yoffset + scale * path[seg][0][1]
         //
         // move to starting point
         //
         str += "G1 X" + x.toFixed(5) + " Y" + y.toFixed(5) + " F" + jog + "\r\n"
         str += "BEAMON\r\n" // beam on
         for (var pt = 1; pt < path[seg].length; ++pt) {
            //
            // move to next point
            //
            x = xoffset + scale * path[seg][pt][0]
            y = yoffset + scale * path[seg][pt][1]
            str += "G1 X" + x.toFixed(5) + " Y" + y.toFixed(5) + " F" + feed + "\r\n"
         }
         str += "BEAMOFF\r\n" // beam off
      }
      //
      // finish
      //
      str += "G1 X0 Y0 F" + jog + "\r\n"
      //str += "CLOSESHUTTER\r\n"
      str += "MSGDISPLAY 1, \"Program Finished\"\r\n"
      //str += "MSGDISPLAY 1, \"{\#F3 \#F}\" \"Time is \#TS\"\n"
      str += "G91\r\n" // incremental coordinate mode
      str += "M2\r\n" // end of program
      //
      // return string
      //
      return str
   }

   return {
      mod_load_handler: mod_load_handler,
      mod_Oxford_path: mod_Oxford_path
   }

});
