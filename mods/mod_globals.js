//
// globals
//
define(function() {
   var exports = {};
   exports.input = "" // current input module
   exports.output = "" // current output module
   exports.settings = "" // settings
   exports.x0 = "" // x origin
   exports.y0 = "" // y origin
   exports.z0 = "" // z origin
   exports.zmin = "" // bottom z
   exports.zjog = "" // z jog
   exports.send = "" // machine send command
   exports.server = '127.0.0.1:12345' // machine send server
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
   var domCache = {};
   // global utility functions
   exports.findEl = function(id,ignoreCache) {
      //if (domCache[id] != undefined && (ignoreCache == undefined || ignoreCache)){
      //   return domCache[id];
      //}
      return document.getElementById(id);
      };
   exports.myeval = function(str){
      //console.log(str);
      eval(str);
      };
   return exports;
   });
