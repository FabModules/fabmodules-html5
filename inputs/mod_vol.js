//
// mod_vol.js
//   fab modules .vol input
//
// Neil Gershenfeld 
// (c) Massachusetts Institute of Technology 2014,5
// 
// This work may be reproduced, modified, distributed, performed, and 
// displayed for any purpose, but must acknowledge the fab modules 
// project. Copyright is retained and must be preserved. The work is 
// provided as is; no warranty is provided, and users accept all 
// liability.
//

define(['require',
   'handlebars',
   'text!templates/mod_vol_input_controls.html',
   'mods/mod_ui',
   'mods/mod_globals',
   'mods/mod_file',
   'processes/mod_mesh',
   'inputs/mod_vol_view'
   ], function(require) {
   
   var ui = require('mods/mod_ui');
   var Handlebars = require('handlebars');
   var mod_vol_input_controls_tpl = Handlebars.compile(require('text!templates/mod_vol_input_controls.html'));
   var globals = require('mods/mod_globals');
   var vol_view = require('inputs/mod_vol_view');
   var fileUtils = require('mods/mod_file');
   var meshUtils = require('processes/mod_mesh');
   var findEl = globals.findEl;

   //
   // mod_load_handler
   //   file load handler
   //
   function mod_load_handler() {
      var file = findEl("mod_file_input")
      file.addEventListener("change", function() {
         mod_vol_read_handler();
         });
      }
   //
   // mod_vol_read_handler
   //    .vol read handler
   //
   function mod_vol_read_handler(event) {
      globals.vol = {}
      //
      // get input file info
      //
      var file_input = findEl("mod_file_input")
      globals.input_file = file_input.files[0]
      globals.input_size = file_input.files[0].size
      globals.input_name = file_input.files[0].name
      globals.input_basename = fileUtils.basename(globals.input_name)
      //
      // set up UI
      //
      globals.mesh.rz = 0
      globals.mesh.rx = 0
      globals.mesh.dy = 0
      globals.mesh.dx = 0
      globals.mesh.s = 1
      globals.vol.bytes = 4
      globals.vol.nx = 1
      globals.vol.ny = 1
      globals.vol.nz = 1
      globals.vol.size = 4
      controls = findEl("mod_input_controls")
      ctx = {
         input_name: globals.input_name,
         input_size: globals.input_size
         };
      controls.innerHTML = mod_vol_input_controls_tpl(ctx);
      var changeUnits = function() {
         if (findEl("mod_float32").checked)
            globals.vol.bytes = 4;
         else if (findEl("mod_int16").checked)
            globals.vol.bytes = 2;
         globals.vol.size =
            globals.vol.bytes * globals.vol.nx * globals.vol.ny * globals.vol.nz;
         findEl("mod_size").innerHTML = globals.vol.size;
         };
      findEl('mod_float32',false).addEventListener("change", changeUnits );
      findEl('mod_int16',false).addEventListener("change", changeUnits );
      findEl("mod_nx",false).addEventListener("keyup", function() {
         globals.vol.nx = parseInt(findEl("mod_nx").value);
         globals.vol.size =
            globals.vol.bytes * globals.vol.nx * globals.vol.ny * globals.vol.nz;
         findEl("mod_size").innerHTML = globals.vol.size;
         });
      findEl("mod_ny",false).addEventListener("keyup", function() {
         globals.vol.ny = parseInt(findEl("mod_ny").value);
         globals.vol.size = globals.vol.bytes * globals.vol.nx * globals.vol.ny * globals.vol.nz;
         findEl("mod_size").innerHTML = globals.vol.size;
         });
      findEl("mod_nz",false).addEventListener("keyup", function() {
         globals.vol.nz = parseInt(findEl("mod_nz").value);
         globals.vol.size = globals.vol.bytes * globals.vol.nx * globals.vol.ny * globals.vol.nz;
         findEl("mod_size").innerHTML = globals.vol.size;
         });
      findEl("show_density",false).addEventListener("click", function() {
         ui.ui_clear();
         if (globals.input_size != globals.vol.size) {
            ui.ui_prompt("error: vol size does not match file size");
            return;
            };
         ui.ui_prompt("scroll or enter to select layer; left/right click or enter to select thresholds")
         globals.vol.layer_size = globals.vol.size/globals.vol.nz;
         globals.vol.layer = parseInt(findEl("mod_layer").value)
         globals.vol.drawing = false
         globals.vol.mode = "density"
         var canvas = findEl("mod_input_canvas");
         canvas.width = globals.vol.nx;
         canvas.height = globals.vol.ny;
         canvas.style.display = "inline";
         canvas.onwheel = function(evt) {
            evt.preventDefault()
            evt.stopPropagation()
            if (evt.deltaY < 0) {
               globals.vol.layer += 1
               findEl("mod_layer").value = globals.vol.layer
               mod_vol_draw_layer()
               }
            else {
               globals.vol.layer -= 1
               findEl("mod_layer").value = globals.vol.layer
               mod_vol_draw_layer()
               }
            }
         canvas.onmousemove = function(evt) {
            var col = Math.floor(globals.vol.nx*(evt.clientX-evt.target.offsetParent.offsetLeft)/canvas.offsetWidth)
            var row = Math.floor(globals.vol.ny*(1-(evt.clientY-evt.target.offsetParent.offsetTop)/canvas.offsetWidth))
            var value = globals.vol.buf[(globals.vol.ny-1-row)*globals.vol.nx+col]
            ui.ui_prompt('row: ' + row+' col: ' + col+' value: '+value.toFixed(3))
            }
         canvas.onmouseup = function(evt) {
            var col = Math.floor(globals.vol.nx*(evt.clientX-evt.target.offsetParent.offsetLeft)/canvas.offsetWidth)
            var row = Math.floor(globals.vol.ny*(1-(evt.clientY-evt.target.offsetParent.offsetTop)/canvas.offsetWidth))
            var value = globals.vol.buf[(globals.vol.ny-1-row)*globals.vol.nx+col]
            if (evt.button == 0) {
               findEl("mod_tmin").value = value
               mod_vol_draw_layer()
               }
            else if (evt.button == 2) {
               findEl("mod_tmax").value = value
               mod_vol_draw_layer()
               }
            }
         canvas.oncontextmenu = function(evt) {
            evt.preventDefault()
            evt.stopPropagation()
            }
         mod_vol_draw_layer()
         })
      findEl("mod_layer",false).addEventListener("keyup", function() {
         globals.vol.layer = parseInt(findEl("mod_layer").value)
         mod_vol_draw_layer()
         })
      findEl("show_section",false).addEventListener("click", function() {
         ui.ui_clear();
         if (globals.input_size != globals.vol.size) {
            ui.ui_prompt("error: vol size does not match file size");
            return;
            };
         ui.ui_prompt("scroll or enter to select layer; left/right click or enter to select thresholds")
         globals.vol.layer_size = globals.vol.size/globals.vol.nz;
         globals.vol.layer = parseInt(findEl("mod_layer").value)
         globals.vol.drawing = false
         globals.vol.mode = "section"
         var canvas = findEl("mod_input_canvas");
         canvas.width = globals.vol.nx;
         canvas.height = globals.vol.ny;
         canvas.style.display = "inline";
         canvas.onwheel = function(evt) {
            evt.preventDefault()
            evt.stopPropagation()
            if (evt.deltaY < 0) {
               globals.vol.layer += 1
               findEl("mod_layer").value = globals.vol.layer
               mod_vol_draw_layer()
               }
            else {
               globals.vol.layer -= 1
               findEl("mod_layer").value = globals.vol.layer
               mod_vol_draw_layer()
               }
            }
         canvas.onmousemove = function(evt) {
            var col = Math.floor(globals.vol.nx*(evt.clientX-evt.target.offsetParent.offsetLeft)/canvas.offsetWidth)
            var row = Math.floor(globals.vol.ny*(1-(evt.clientY-evt.target.offsetParent.offsetTop)/canvas.offsetWidth))
            var value = globals.vol.buf[(globals.vol.ny-1-row)*globals.vol.nx+col]
            ui.ui_prompt('row: ' + row+' col: ' + col+' value: '+value.toFixed(3))
            }
         canvas.onmouseup = function(evt) {
            var col = Math.floor(globals.vol.nx*(evt.clientX-evt.target.offsetParent.offsetLeft)/canvas.offsetWidth)
            var row = Math.floor(globals.vol.ny*(1-(evt.clientY-evt.target.offsetParent.offsetTop)/canvas.offsetWidth))
            var value = globals.vol.buf[(globals.vol.ny-1-row)*globals.vol.nx+col]
            if (evt.button == 0) {
               findEl("mod_tmin").value = value
               mod_vol_draw_layer()
               }
            else if (evt.button == 2) {
               findEl("mod_tmax").value = value
               mod_vol_draw_layer()
               }
            }
         canvas.oncontextmenu = function(evt) {
            evt.preventDefault()
            evt.stopPropagation()
            }
         mod_vol_draw_layer()
         })
      findEl("mod_tmin",false).addEventListener("keyup", function() {
         mod_vol_draw_layer()
         })
      findEl("mod_tmax",false).addEventListener("keyup", function() {
         mod_vol_draw_layer()
         })
      findEl("show_mesh",false).addEventListener("click", function() {
         ui.ui_clear();
         if (globals.input_size != globals.vol.size) {
            ui.ui_prompt("error: vol size does not match file size");
            return;
            };
         ui.ui_prompt("scroll or enter to select layer; left/right click or enter to select thresholds")
         globals.vol.layer_size = globals.vol.size/globals.vol.nz;
         globals.vol.layer = parseInt(findEl("mod_layer").value)
         globals.vol.drawing = false
         globals.vol.mode = "mesh"
         var canvas = findEl("mod_input_canvas");
         canvas.width = globals.vol.nx;
         canvas.height = globals.vol.ny;
         canvas.style.display = "inline";
         canvas.onmousemove = null
         canvas.onmouseup = null
         canvas.oncontextmenu = function(evt) {
            evt.preventDefault()
            evt.stopPropagation()
            }
         globals.mesh.rules = meshUtils.march_rules()
         mod_vol_draw_layer()
         })
      findEl("save_stl",false).addEventListener("click", function() {
         ui.ui_clear();
         if (globals.input_size != globals.vol.size) {
            ui.ui_prompt("error: vol size does not match file size");
            return;
            };
         ui.ui_prompt("layer: 0, triangles: 0 (s to stop)")
         var canvas = findEl("mod_input_canvas");
         canvas.width = globals.vol.nx;
         canvas.height = globals.vol.ny;
         canvas.style.display = "inline";
         canvas.onmousemove = null
         canvas.onmouseup = null
         canvas.oncontextmenu = function(evt) {
            evt.preventDefault()
            evt.stopPropagation()
            }
         globals.vol.triangles = null
         mod_vol_save_stl()
         })
      }
   //
   // mod_vol_draw_layer
   //
   function mod_vol_draw_layer() {
      if (!((globals.vol.layer >= 0) && (globals.vol.layer < globals.vol.nz) && (globals.vol.drawing == false)))
         return
      globals.vol.drawing == true
      var file_reader = new FileReader()
      file_reader.onload = mod_vol_draw_layer_handler
      start = globals.vol.layer*globals.vol.layer_size
      end = (globals.vol.layer+1)*globals.vol.layer_size
      var blob = globals.input_file.slice(start,end)
      file_reader.readAsArrayBuffer(blob)
      }
   //
   // mod_vol_draw_layer_handler
   //
   function mod_vol_draw_layer_handler(event) {
      if (findEl("mod_float32").checked)
         var buf = new Float32Array(event.target.result)
      else if (findEl("mod_int16").checked)
         var buf = new Uint16Array(event.target.result)
      globals.vol.buf = buf
      if (globals.vol.mode == "mesh") {
         var file_reader = new FileReader()
         file_reader.onload = mod_vol_draw_layer_mesh_handler
         start = (globals.vol.layer+1)*globals.vol.layer_size
         end = (globals.vol.layer+2)*globals.vol.layer_size
         var blob = globals.input_file.slice(start,end)
         file_reader.readAsArrayBuffer(blob)
         return
         }
      var nx = globals.vol.nx
      var ny = globals.vol.ny
      var nz = globals.vol.nz
      var canvas = findEl("mod_input_canvas")
      var ctx = canvas.getContext("2d")
      var img = ctx.getImageData(0,0,canvas.width,canvas.height)
      var data = img.data
      //
      // show layer
      //
      if (globals.vol.mode == "density") {
         var vmin = 1e10
         var vmax = -1e10
         for (var row = 0; row < ny; ++row) {
            for (var col = 0; col < nx; ++col) {
               value = buf[(ny-1-row)*nx+col]
               vmax = Math.max(value,vmax)
               vmin = Math.min(value,vmin)
               }
            }
         for (var row = 0; row < ny; ++row) {
            for (var col = 0; col < nx; ++col) {
               var value = buf[(ny-1-row)*nx+col]
               value = Math.floor(0.5+255*(value-vmin)/(vmax-vmin))
               data[(ny-1-row)*nx*4+col*4+0] = value
               data[(ny-1-row)*nx*4+col*4+1] = value
               data[(ny-1-row)*nx*4+col*4+2] = value
               data[(ny-1-row)*nx*4+col*4+3] = 255
               }
            }
         }
      else if (globals.vol.mode == "section") {
         var tmin = parseFloat(findEl("mod_tmin").value)
         var tmax = parseFloat(findEl("mod_tmax").value)
         for (var row = 0; row < ny; ++row) {
            for (var col = 0; col < nx; ++col) {
               var value = buf[(ny-1-row)*nx+col]
               if ((value >= tmin) && (value <= tmax))
                  value = 255
               else
                  value = 0
               data[(ny-1-row)*nx*4+col*4+0] = value
               data[(ny-1-row)*nx*4+col*4+1] = value
               data[(ny-1-row)*nx*4+col*4+2] = value
               data[(ny-1-row)*nx*4+col*4+3] = 255
               }
            }
         }
      ctx.putImageData(img, 0, 0)
      globals.vol.drawing == false
      }               
   //
   // mod_vol_draw_layer_mesh_handler
   //
   function mod_vol_draw_layer_mesh_handler(event) {
      if (findEl("mod_float32").checked)
         var buf = new Float32Array(event.target.result)
      else if (findEl("mod_int16").checked)
         var buf = new Uint16Array(event.target.result)
      //
      // triangulate layer
      //
      var tmin = parseFloat(findEl("mod_tmin").value)
      var tmax = parseFloat(findEl("mod_tmax").value)
      var mesh = meshUtils.march_triangulate(tmin,tmax,globals.vol.buf,buf,
         globals.vol.nx,globals.vol.ny,globals.vol.nz,globals.vol.layer)
      //
      // draw layer
      //
      vol_view.mesh_draw(mesh)
      }
   //
   // mod_vol_save_stl
   //
   function mod_vol_save_stl() {
      globals.vol.stop = false;
      window.onkeydown = function(evt) {
         if (evt.keyCode == 83) globals.vol.stop = true;
         }
      globals.mesh.rules = meshUtils.march_rules()
      globals.vol.layer_size = globals.vol.size/globals.vol.nz;
      globals.vol.layer = 0
      globals.vol.triangle = 0
      if (globals.vol.triangles != null) {
         //
         // second pass
         //
         globals.vol.index = 80+4
         globals.vol.buf = new ArrayBuffer(80+4+globals.vol.triangles*(4*3*4+2))
         globals.vol.view = new DataView(globals.vol.buf)
         }
      var file_reader = new FileReader()
      file_reader.onload = mod_vol_save_stl_start_handler
      start = 0
      end = globals.vol.layer_size
      var blob = globals.input_file.slice(start,end)
      file_reader.readAsArrayBuffer(blob)
      }
   //
   // mod_vol_save_stl_start_handler
   //
   function mod_vol_save_stl_start_handler(event) {
      if (findEl("mod_float32").checked)
         globals.vol.buf1 = new Float32Array(event.target.result)
      else if (findEl("mod_int16").checked)
         globals.vol.buf1 = new Uint16Array(event.target.result)
      var file_reader = new FileReader()
      file_reader.onload = mod_vol_save_stl_read_handler
      start = globals.vol.layer_size
      end = 2*globals.vol.layer_size
      var blob = globals.input_file.slice(start,end)
      file_reader.readAsArrayBuffer(blob)
      }
   //
   // mod_vol_save_stl_read_handler
   //
   function mod_vol_save_stl_read_handler(event) {
      if (globals.vol.stop == true) {
         globals.vol.mesh = null
         ui.ui_prompt("")
         window.onkeydown = null
         return
         }
      globals.vol.buf0 = globals.vol.buf1
      if (findEl("mod_float32").checked)
         globals.vol.buf1 = new Float32Array(event.target.result)
      else if (findEl("mod_int16").checked)
        globals.vol.buf1 = new Uint16Array(event.target.result)
      //
      // triangulate layer
      //
      var tmin = parseFloat(findEl("mod_tmin").value)
      var tmax = parseFloat(findEl("mod_tmax").value)
      var mesh = meshUtils.march_triangulate(tmin,tmax,globals.vol.buf0,globals.vol.buf1,
         globals.vol.nx,globals.vol.ny,globals.vol.nz,globals.vol.layer)
      //
      // accumulate layer
      //
      if (globals.vol.triangles == null) {
         //
         // first pass
         //
         vol_view.mesh_draw(mesh)
         globals.vol.triangle += mesh.length
         ui.ui_prompt("mesh layer: "+globals.vol.layer+" triangles: "+globals.vol.triangle+" (s to stop)")
         }
      else {
         //
         // second pass
         //
         for (var t = 0; t < mesh.length; ++t) {
            globals.vol.view.setFloat32(globals.vol.index+12,mesh[t][0][0],true)
            globals.vol.view.setFloat32(globals.vol.index+16,mesh[t][0][1],true)
            globals.vol.view.setFloat32(globals.vol.index+20,mesh[t][0][2],true)
            globals.vol.view.setFloat32(globals.vol.index+24,mesh[t][1][0],true)
            globals.vol.view.setFloat32(globals.vol.index+28,mesh[t][1][1],true)
            globals.vol.view.setFloat32(globals.vol.index+32,mesh[t][1][2],true)
            globals.vol.view.setFloat32(globals.vol.index+36,mesh[t][2][0],true)
            globals.vol.view.setFloat32(globals.vol.index+40,mesh[t][2][1],true)
            globals.vol.view.setFloat32(globals.vol.index+44,mesh[t][2][2],true)
            globals.vol.index += 4*3*4+2
            }
         globals.vol.triangle += mesh.length
         ui.ui_prompt("write layer: "+globals.vol.layer+" triangles: "+globals.vol.triangle+"/"+globals.vol.triangles+" (s to stop)")
         }
      //
      // increment layer
      //
      globals.vol.layer += 1
      if (globals.vol.layer < (globals.vol.nz-1)) {
         //
         // not done, read next layer
         //
         var file_reader = new FileReader()
         file_reader.onload = mod_vol_save_stl_read_handler
         start = (globals.vol.layer+1)*globals.vol.layer_size
         end = (globals.vol.layer+2)*globals.vol.layer_size
         var blob = globals.input_file.slice(start,end)
         file_reader.readAsArrayBuffer(blob)
         return
         }
      else {
         //
         // done
         //
         if (globals.vol.triangles == null) {
            //
            // first pass
            //
            globals.vol.triangles = globals.vol.triangle
            mod_vol_save_stl()
            }
         else {
            //
            // second pass
            //
            ui.ui_prompt("")
            globals.vol.view.setUint32(80,globals.vol.triangles,true)
            var blob = new Blob([globals.vol.buf], {
               type: "application/octet-stream"
               });
            var download_link = findEl("mod_download")
            download_link.download = globals.input_name + ".stl"
            download_link.href = window.URL.createObjectURL(blob)
            download_link.click()
            }
         }
      }
   return {
      mod_load_handler: mod_load_handler,
      draw_layer: mod_vol_draw_layer
      }
   });

