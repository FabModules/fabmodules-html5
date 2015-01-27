//
// mod_settings.js
//   fab modules site settings
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
// mod_load_handler
//   file load handler
//
function mod_load_handler() {
   var file = document.getElementById("mod_file_input")
   file.setAttribute("onchange","mod_settings_read_handler()")
   }
//
// mod_settings_read_handler
//    settings read handler
//
function mod_settings_read_handler(event) {
   //
   // get input file
   //
   var file_input = document.getElementById("mod_file_input")
   document.mod.input_file = file_input.files[0]
   document.mod.input_name = file_input.files[0].name
   document.mod.input_basename = mod_file_basename(document.mod.input_name)
   //
   // read as text
   //
   var file_reader = new FileReader()
   file_reader.onload = mod_settings_load_handler
   file_reader.readAsText(document.mod.input_file)
   }
//
// mod_settings_load_handler
//    settings load handler
//
function mod_settings_load_handler(event) {
   //
   // get size
   //
   str = event.target.result
   document.mod.settings = str
   try {
      eval(str)
      } catch (e) {
      mod_ui_prompt(document.mod.input_name+" error: "+e.message)
      return
      }      
   mod_ui_prompt("read "+document.mod.input_name)
   }
