//
// mod_inputs.js
//   fab modules inputs
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

//
// define input types and handlers
//
var input_array = [
   ["image (.png)","inputs/mod_png.js"],
   ["drawing (.svg)","inputs/mod_svg.js"],
   ["path (.svg)",""],
   ["mesh (.stl)","inputs/mod_stl.js"],
   ["volume (.vol)","inputs/mod_vol.js"],
   ["volume (.gif)",""],
   ["frep (.f)",""],
   ["load settings","inputs/mod_settings.js"]
   ]
//
// call mod_inputs
//
mod_inputs()
//
// mod_inputs
//    set up inputs menu
//
function mod_inputs() {
   var label = document.getElementById("mod_inputs_label")
   label.innerHTML ="input format"
   label.onclick = function (e) {
      mod_ui_clear()
      var label = document.getElementById("mod_outputs_label")
      label.style.display = "none"
      var label = document.getElementById("mod_processes_label")
      label.style.display = "none"
      var div = document.getElementById("mod_input_controls")
      div.innerHTML = ""
      var div = document.getElementById("mod_output_controls")
      div.innerHTML = ""
      var div = document.getElementById("mod_process_controls")
      div.innerHTML = ""
      mod_ui_prompt("input file to read?")
      mod_ui_menu_file(input_array,"mod_inputs")
      mod_ui_view_reset()
      }
   label.onmouseover = function (e) {
      this.style.background = highlight_background_color
      }
   label.onmouseout = function (e) {
      this.style.background = background_color
      }
   }

