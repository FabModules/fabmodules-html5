require.config({
   paths: {
      'text': 'text',
      'handlebars' : 'handlebars-v2.0.0'
   }

});


require(["mods/mod_ui","inputs/mod_inputs","mods/mod_config"], function(mod_ui, mod_inputs,mod_config){
   
   mod_config.init();
   mod_ui.initGUI();
   mod_inputs.initInputs();
   
   // temporary workaround for add_process and edit_process
   // ideally we could have a json process descriptor and a global process registry
   
   window.mod_add_process = mod_ui.add_process;
   window.mod_edit_process = mod_ui.edit_process;
   
   
});
