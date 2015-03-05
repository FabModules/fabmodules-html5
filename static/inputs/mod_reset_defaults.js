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
      mod_config.reset();
      alert('Please reload the page to use new defaults');
      //return false;
   }

   return {
      mod_load_handler: mod_load_handler
   };

});
