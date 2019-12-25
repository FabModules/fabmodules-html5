//
// mod_outputs.js
//   outputs list
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
define(['require', 'mods/mod_ui'], function(require) {
   var ui = require('mods/mod_ui')

   //
   // output types and handlers
   //
   var output_array = [
      ["SVG (.svg)", "outputs/mod_svg.js"],
      ["PostScript (.eps)", "outputs/mod_eps.js"],
      ["Epilog laser (.epi)", "outputs/mod_Epilog.js"],
      ["Trotec laser (.tro)", "outputs/mod_Trotec.js"],
      ["GCC laser (.gcc)", "outputs/mod_GCC_laser.js"],
      ["GCC vinyl (.gcc)", "outputs/mod_GCC_vinyl.js"],
      ["Othermill (.nc)", "outputs/mod_othermill.js"],
      ["Oxford ulaser (.pgm)", "outputs/mod_Oxford.js"],
      ["Roland mill (.rml)", "outputs/mod_Roland_mill.js"],
      ["Roland vinyl (.camm)", "outputs/mod_Roland_vinyl.js"],
      ["ShopBot (.sbp)", "outputs/mod_Shopbot.js"],
      ["G-codes (.nc)", "outputs/mod_G.js"],
      ["Smoothie (.gcode)", "outputs/mod_Smoothie_G.js"],
      ["OctoPrint (.gcode)", "outputs/mod_Octo_G.js"],
      ["Universal laser (.uni)", ""],
      ["image (.png)", ""],
      ["DXF (.dxf)", ""],
      ["Gerber (.grb)", ""],
      ["Excellon (.drl)", ""],
      ["Resonetics excimer (.oms)", ""],
      ["Omax waterjet (.ord)", ""],
      ["mesh (.stl)", ""],
      ["MTM (VM)", ""]
   ]
   //
   // mod_outputs
   //    set up outputs menu
   //

      function mod_outputs() {
         var label = document.getElementById("mod_outputs_label")
         label.innerHTML = "output format"
         label.style.display = "block"
         label.onclick = function(e) {
            ui.ui_clear()
            var input_canvas = document.getElementById("mod_input_canvas")
            input_canvas.style.display = "inline"
            var label = document.getElementById("mod_processes_label")
            label.style.display = "none"
            var div = document.getElementById("mod_output_controls")
            div.innerHTML = ""
            var div = document.getElementById("mod_process_controls")
            div.innerHTML = ""
            ui.ui_menu_action(output_array, "mod_outputs")
         }
         label.onmouseover = function(e) {
            this.style.background = ui.defaults.highlight_background_color
         }
         label.onmouseout = function(e) {
            this.style.background = ui.defaults.background_color
         }
      }

   return {
      init: mod_outputs
   }

});
