//
// mod_settings.js
//   fab modules site configuration
//
// Fiore Basile 
// (c) Fab Lab Cascina 2015
// 
// This work may be reproduced, modified, distributed, performed, and 
// displayed for any purpose, but must acknowledge the fab modules 
// project. Copyright is retained and must be preserved. The work is 
// provided as is; no warranty is provided, and users accept all 
// liability.
//

define(['mods/mod_globals', 'mods/mod_ui', 'mods/mod_file', 'mods/mod_config'], function(globals, ui, fileUtils, mod_config) {

   var findEl = globals.findEl;

   //
   // mod_load_handler
   //   file load handler
   //

   function mod_load_handler() {
      var file = findEl("mod_file_input")
      file.addEventListener("change", mod_configure_read_handler);
      // file.setAttribute("onchange","mod_settings_read_handler()")
   }
   //
   // mod_settings_read_handler
   //    settings read handler
   //

   function mod_configure_read_handler(event) {
      //
      // get input file
      //
      var file_input = findEl("mod_file_input")
      globals.input_file = file_input.files[0]
      globals.input_name = file_input.files[0].name
      globals.input_basename = fileUtils.basename(globals.input_name)
      //
      // read as text
      //
      var file_reader = new FileReader()
      file_reader.onload = mod_configure_load_handler
      file_reader.readAsText(globals.input_file)
   }
   //
   // mod_settings_load_handler
   //    settings load handler
   //

   function mod_configure_load_handler(event) {
      //
      // get size
      //
      str = event.target.result
      jsonConfig = mod_config.read()
      // globals.settings = str
      try {
         jsonConfig = JSON.parse(str)
      } catch (e) {
         ui.ui_prompt(globals.input_name + " error: " + e.message)
         return
      }
      mod_config.update(jsonConfig);
      ui.ui_prompt("Please reload the page to use new config")
      
   }


   return {
      mod_load_handler: mod_load_handler
   };

});
