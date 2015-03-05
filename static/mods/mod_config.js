
define(['text!config.json'],function(configFile) {
   
   var default_config = JSON.parse(configFile);
   
   
   var supports_html5_storage = function() {
        try {
          return 'localStorage' in window && window['localStorage'] !== null;
        } catch (e) {
          return false;
        }
   };
   
   
   var init_config = function(){
      if (supports_html5_storage()){
         if (localStorage.config) {
            try {
            return JSON.parse(localStorage.config);
            } catch(Exception){
               return default_config;
            }
         } else {
            localStorage.config = JSON.stringify(default_config);
            return default_config;
         }         
      }
      return default_config;
   };
   
   
   var reset_config = function(){
      if (supports_html5_storage()){
            localStorage.config = default_config;
      } else {
          // Sorry! No Web Storage support..
      }      
   };
   
   var update_config = function(new_config){
      if (supports_html5_storage()){
         localStorage.config = JSON.stringify(new_config);
      }
   }

   var read_config = function(){
      if(supports_html5_storage()) {
          // Code for localStorage/sessionStorage.
         try {
         return JSON.parse(localStorage.config);
         } catch (Exception){
            return default_config;
         }
      }
      return default_config;
   }
   
   return {
      read: read_config,
      init: init_config,
      update: update_config,
      reset: reset_config  
   };
   
});