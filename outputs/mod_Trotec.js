//
// mod_Trotec.js
//   fab modules Trotec lasercutter output
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
      ["name","cut cardboard"],
      ["module","Trotec"],
      ["controls","mod_path_image_2D_controls"],
      ["routine","mod_Trotec_path"],
      ["command","mod_serial.py /dev/ttyUSB0 19200"],
      ["diameter","0.25"],
      ["power","25"],
      ["velocity","75"],
      ])   
   mod_add_process([
      ["name","cut acrylic"],
      ["module","Trotec"],
      ["controls","mod_path_image_2D_controls"],
      ["routine","mod_Trotec_path"],
      ["command","mod_serial.py /dev/ttyUSB0 19200"],
      ["diameter","0.25"],
      ["power","75"],
      ["velocity","75"],
      ])   
   mod_add_process([
      ["name","cut wood"],
      ["module","Trotec"],
      ["controls","mod_path_image_2D_controls"],
      ["routine","mod_Trotec_path"],
      ["command","mod_serial.py /dev/ttyUSB0 19200"],
      ["diameter","0.25"],
      ["power","50"],
      ["velocity","75"],
      ])   
   mod_add_process([
      ["name","cut mylar"],
      ["module","Trotec"],
      ["controls","mod_path_image_2D_controls"],
      ["routine","mod_Trotec_path"],
      ["command","mod_serial.py /dev/ttyUSB0 19200"],
      ["diameter","0.25"],
      ["power","10"],
      ["velocity","75"],
      ])   
   mod_add_process([
      ["name","halftone cardboard"],
      ["module","Trotec"],
      ["controls","mod_path_image_halftone_controls"],
      ["routine","mod_Trotec_path"],
      ["command","mod_serial.py /dev/ttyUSB0 19200"],
      ["power","15"],
      ["velocity","75"],
      ])   
   mod_add_process([
      ["name","halftone wood "],
      ["module","Trotec"],
      ["controls","mod_path_image_halftone_controls"],
      ["routine","mod_Trotec_path"],
      ["command","mod_serial.py /dev/ttyUSB0 19200"],
      ["diameter","0.25"],
      ["power","20"],
      ["velocity","75"],
      ])   
   mod_add_process([
      ["name","halftone acrylic"],
      ["module","Trotec"],
      ["controls","mod_path_image_halftone_controls"],
      ["routine","mod_Trotec_path"],
      ["command","mod_serial.py /dev/ttyUSB0 19200"],
      ["diameter","0.25"],
      ["power","25"],
      ["velocity","75"],
      ])   
   mod_add_process([
      ["name","halftone mylar"],
      ["module","Trotec"],
      ["controls","mod_path_image_halftone_controls"],
      ["routine","mod_Trotec_path"],
      ["command","mod_serial.py /dev/ttyUSB0 19200"],
      ["diameter","0.25"],
      ["power","10"],
      ["velocity","75"],
      ])
   }
//
// mod_load_handler
//   file load handler
//
function mod_load_handler() {
   document.mod.output = "Trotec"
   mod_ui_prompt("process?")
   var controls = document.getElementById("mod_output_controls")
   controls.innerHTML = "<br><b>output</b>"
   controls.innerHTML += "<br>caution: not yet tested"
   controls.innerHTML += "<br>model: <select id='mod_model'>\
      <option value='Speedy_100' selected>Speedy 100</option>\
      <option value='Speedy_100_Flexx_CO2'>Speedy 100 Flexx CO2</option>\
      <option value='Speedy_100_Flexx_fiber'>Speedy 100 Flexx fiber</option>\
      <option value='Speedy_400'>Speedy 400</option>\
      </select>"
   controls.innerHTML += "<br>power (%):"
   controls.innerHTML += "&nbsp;<input type='text' id='mod_power' size='3' value='25'>"
   controls.innerHTML += "<br>velocity (mm/s):"
   controls.innerHTML += "&nbsp;<input type='text' id='mod_velocity' size='3' value='10'>"
   controls.innerHTML += "<br>frequency: (Hz)"
   controls.innerHTML += "&nbsp;<input type='text' id='mod_frequency' size='3' value='5000'>"
   controls.innerHTML += "<br>origin (mm): <br>"
   controls.innerHTML += "x: <input type='text' id='mod_x_origin' size='3' value='50'> "
   controls.innerHTML += "y: <input type='text' id='mod_y_origin' size='3' value='50'>"
	   controls.innerHTML += "<br><input type='radio' name='origin' id='mod_top_left' checked> left top right <input type='radio' name='origin' id='mod_top_right'>"
   controls.innerHTML += "<br><input type='radio' name='origin' id='mod_bottom_left'> left bot right <input type='radio' name='origin' id='mod_bottom_right'>"
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
// mod_Trotec_path
//    convert path
// send 19200, xon/xoff
//
function mod_Trotec_path(path) {
   document.mod.type = ".tro"
   var model_menu = document.getElementById("mod_model")
   var model = model_menu.options[model_menu.selectedIndex].value
   if (model == "Speedy_100") {
      var um_per_inc = 5
      var str = "SL0\n" // CO2
      }
   else if (model == "Speedy_100_Flexx_CO2") {
      var um_per_inc = 5
      var str = "SL0\n" // CO2
      }
   else if (model == "Speedy_100_Flexx_fiber") {
      var um_per_inc = 5
      var str = "SL4\n" // fiber pulse
      }
   else if (model == "Speedy_400") {
      var um_per_inc = 5.097
      var str = "SL0\n" // CO2
      }
   var dx = 25.4*document.mod.width/document.mod.dpi
   var dy = 25.4*document.mod.height/document.mod.dpi
   var nx = document.mod.width
   var ny = document.mod.height
   var power = 100*parseFloat(document.getElementById("mod_power").value)
   var frequency = parseFloat(document.getElementById("mod_frequency").value)
   var scale = 1000*(dx/(nx-1))/um_per_inc
   var velocity = parseFloat(document.getElementById("mod_velocity").value)
      *1000/um_per_inc
   var ox = parseFloat(document.getElementById("mod_x_origin").value)
   var oy = parseFloat(document.getElementById("mod_y_origin").value)
   var xorg = 2600 // Speedy
   var yorg = 800 // "
   if (document.getElementById("mod_bottom_left").checked) {
      var xoffset = xorg + 1000*ox/um_per_inc
      var yoffset = yorg + 1000*(oy-dy)/um_per_unc
      }
   else if (document.getElementById("mod_bottom_right").checked) {
      var xoffset = xorg + 1000*(ox-dx)/um_per_inc
      var yoffset = yorg + 1000*(oy-dy)/um_per_inc
      }
   else if (document.getElementById("mod_top_left").checked) {
      var xoffset = xorg + 1000*ox/um_per_inc
      var yoffset = yorg + 1000*oy/um_per_inc
      }
   else if (document.getElementById("mod_top_right").checked) {
      var xoffset = xorg + 1000*(ox-dx)/um_per_inc
      var yoffset = yorg + 1000*oy/um_per_inc
      }
   str += "ED3\n" // exhaust on
   str += "ED4\n" // air assist on
   str += "VS"+velocity.toFixed(0)+"\n" // set velocity
   str += "LF"+frequency.toFixed(0)+"\n" // set frequency
   str += "LP"+power.toFixed(0)+"\n" // set power
   str += "EC\n" // execute
   //
   // loop over segments
   //
   for (var seg = 0; seg < path.length; ++ seg) {
      //
      // loop over points
      //
      x = xoffset + scale * path[seg][0][0]
      y = yoffset + scale * (ny - path[seg][0][1])
      if (x < 0) x = 0
      if (y < 0) y = 0
      str += "PA"+x.toFixed(0)+","+y.toFixed(0)+"\n" // move to start point
      str += "PD\n" // laser on
      for (var pt = 1; pt < path[seg].length; ++pt) {
         x = xoffset + scale * path[seg][pt][0]
         y = yoffset + scale * (ny - path[seg][pt][1])
         if (x < 0) x = 0
         if (y < 0) y = 0
         str += "PA"+x.toFixed(0)+","+y.toFixed(0)+"\n" // move to next point
         }
      str += "PU\n" // laser off
      str += "EC\n" // execute
      }
   str += "EO3\n" // exhaust off
   str += "EO4\n" // air assist off
   str += "PA0,0\n" // move home   
   str += "EC\n" // execute
   return str
   }

