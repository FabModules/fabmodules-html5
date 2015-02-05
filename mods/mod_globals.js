//
// globals
//
define(function() {

   var exports = {};
   exports.input = "" // current input module
   exports.output = "" // current output module
   exports.settings = "" // settings
   exports.xmin = "" // last xmin
   exports.ymin = "" // last ymin
   exports.zmin = "" // last zmin
   exports.server = '127.0.0.1:12345' // machine server
   exports.type = "" // file type extension
   exports.processes = {} // processes
   exports.process_edits = {} // process edits
   exports.dx = "" // view dx
   exports.dy = "" // view dy
   exports.dz = "" // view dz
   exports.rx = "" // view rx
   exports.ry = "" // view ry
   exports.rz = "" // view rz
   exports.s = "" // view scale
   exports.mesh = {} // mesh data
   exports.vol = {} // volume data



   // global utility functions
   exports.findEl = function(id) {
      return document.getElementById(id)
   };
   
   exports.myeval = function(str){
      //console.log(str);
      eval(str);
   };


   return exports;
});
