//
// mod_vol.js
//   fab modules .vol input
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
define(['require',
   'handlebars',
   'text!templates/mod_vol_input_controls.html',
   'mods/mod_ui',
   'mods/mod_globals',
   'inputs/mod_vol_view',
   'mods/mod_file',
   'processes/mod_mesh_view'
], function(require) {
   
   var ui = require('mods/mod_ui');
   var Handlebars = require('handlebars');
   var mod_vol_input_controls_tpl = Handlebars.compile(require('text!templates/mod_vol_input_controls.html'));
   var globals = require('mods/mod_globals');
   var vol_view = require('inputs/mod_vol_view');
   var mesh_view = require('processes/mod_mesh_view');
   var fileUtils = require('mods/mod_file');
   var findEl = globals.findEl;

   //
   // load viewer routines
   //
   // var script = document.createElement("script")
   // script.type = "text/javascript"
   // script.src = "inputs/mod_vol_view.js"
   // document.body.appendChild(script)
   //
   // mod_load_handler
   //   file load handler
   //

   function mod_load_handler() {
      var file = findEl("mod_file_input")
      // file.setAttribute("onchange", "mod_vol_read_handler()")
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
      /*      controls.innerHTML = "<b>input</b><br>"
      controls.innerHTML += "file: " + globals.input_name + "<br>"
      controls.innerHTML += "file size: " + globals.input_size + "<br>"
      controls.innerHTML += "type: "
      controls.innerHTML += "float 32 <input type='radio' name='mod_units' id='mod_float32' checked>";
      controls.innerHTML += "int 16 <input type='radio' name='mod_units' id='mod_int16'">
      controls.innerHTML += "nx: <input type='text' id='mod_nx' size='3' value='1'>";
      controls.innerHTML += "<br>"
      controls.innerHTML += "ny: <input type='text' id='mod_ny' size='3' value='1'>";
      controls.innerHTML += "<br>"
      controls.innerHTML += "nz: <input type='text' id='mod_nz' size='3' value='1'>";
      controls.innerHTML += "<br>"
      controls.innerHTML += "vol size: <span id='mod_size'>4</span><br>"
      //controls.innerHTML += "voxel size (um): <input type='text' id='mod_size' size='3' value='1'><br>"
      controls.innerHTML += "<input id='show_density' type='button' value='show density'>";
      controls.innerHTML += "<br>"
      controls.innerHTML += "min value: <input type='text' id='mod_vmin' size='3' value=''><br>"
      controls.innerHTML += "max value: <input type='text' id='mod_vmax' size='3' value=''><br>"
      controls.innerHTML += "<input type='button' value='show histogram' id='show_histogram'>" 
      controls.innerHTML += "<br>"
      controls.innerHTML += "min threshold: <input type='text' id='mod_min_threshold' size='3' value=''><br>"
      controls.innerHTML += "max threshold: <input type='text' id='mod_max_threshold' size='3' value=''><br>"
      controls.innerHTML += "<input type='button' id='show_height' value='show height'>";
      controls.innerHTML += "<br>"
      controls.innerHTML += "<input type='button' id='show_mesh' value='show mesh'>";
      controls.innerHTML + = "<br>"
      controls.innerHTML += "triangles: <input type='text' id='mod_triangles' size='8' value=''><br>"
      controls.innerHTML += "<input type='button' id='save_stl' value='save .stl'>";
      controls.innerHTML += '<br>'; **/

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

      findEl('mod_float32').addEventListener("change", changeUnits );
      findEl('mod_int16').addEventListener("change", changeUnits );


     
      findEl("mod_nx").addEventListener("keyup", function() {
         globals.vol.nx = parseInt(findEl("mod_nx").value);
         globals.vol.size =
            globals.vol.bytes * globals.vol.nx * globals.vol.ny * globals.vol.nz;
         findEl("mod_size").innerHTML = globals.vol.size;
      });
      findEl("mod_ny").addEventListener("keyup", function() {
         globals.vol.ny = parseInt(findEl("mod_ny").value);
         globals.vol.size = globals.vol.bytes * globals.vol.nx * globals.vol.ny * globals.vol.nz;
         findEl("mod_size").innerHTML = globals.vol.size;
      });
      findEl("mod_nz").addEventListener("keyup", function() {
         globals.vol.nz = parseInt(findEl("mod_nz").value);
         globals.vol.size = globals.vol.bytes * globals.vol.nx * globals.vol.ny * globals.vol.nz;
         findEl("mod_size").innerHTML = globals.vol.size;
      });
      findEl("show_density").addEventListener("click", function() {
         ui.ui_clear();
         var canvas = findEl("mod_input_canvas");
         canvas.width = globals.vol.nx;
         canvas.height = globals.vol.ny;
         canvas.style.display = "inline";
         if (globals.input_size != globals.vol.size) {
            ui.ui_prompt("error: vol size does not match file size");
            return;
         };
         globals.vol.layer_size = globals.vol.size / globals.vol.nz;
         var file_reader = new FileReader();
         file_reader.onload = mod_vol_density_handler;
         globals.vol.stop = false;
         window.onkeydown = function(evt) {
            if (evt.keyCode == 83) globals.vol.stop = true;
         };
         globals.vol.layer = 0;
         globals.vol.vmax = -1e10;
         globals.vol.vmin = 1e10;
         globals.vol.buf = new Float32Array(globals.vol.nx * globals.vol.ny);
         var blob = globals.input_file.slice(0, globals.vol.layer_size);
         file_reader.readAsArrayBuffer(blob);
      });
      findEl('show_histogram').addEventListener("click", function() {
         var nhist = 100;
         ui.ui_clear();
         var canvas = findEl("mod_input_canvas");
         canvas.width = globals.vol.nx;
         canvas.height = globals.vol.ny;
         canvas.style.display = "inline";
         if ((findEl("mod_vmin").value == "") || (findEl("mod_vmax").value == "")) {
            ui.ui_prompt("error: show density to find limits");
            return;
         };
         globals.vol.layer_size = globals.vol.size / globals.vol.nz;
         var file_reader = new FileReader();
         file_reader.onload = mod_vol_histogram_handler;
         globals.vol.stop = false;
         window.onkeydown = function(evt) {
            if (evt.keyCode == 83) globals.vol.stop = true;
         };
         globals.vol.hmax = -1e10;
         globals.vol.layer = 0;
         globals.vol.buf = new Uint32Array(nhist);
         var blob = globals.input_file.slice(0, globals.vol.layer_size);
         file_reader.readAsArrayBuffer(blob);
      });
      findEl('show_height').addEventListener("click", function() {
         ui.ui_clear();
         var canvas = findEl("mod_input_canvas");
         canvas.width = globals.vol.nx;
         canvas.height = globals.vol.ny;
         canvas.style.display = "inline";
         if ((findEl("mod_min_threshold").value == "") || (findEl("mod_max_threshold").value == "")) {
            ui.ui_prompt("error: show histogram to find thresholds");
            return;
         };
         globals.vol.layer_size = globals.vol.size / globals.vol.nz;
         var file_reader = new FileReader();
         file_reader.onload = mod_vol_height_handler;
         globals.vol.stop = false;
         window.onkeydown = function(evt) {
            if (evt.keyCode == 83) globals.vol.stop = true;
         };
         globals.vol.layer = 0;
         globals.vol.buf = new Uint16Array(globals.vol.nx * globals.vol.ny);
         var blob = globals.input_file.slice(0, globals.vol.layer_size);
         file_reader.readAsArrayBuffer(blob);
      });
      findEl("show_mesh").addEventListener("click", function() {
         ui.ui_clear();
         var canvas = findEl("mod_input_canvas");
         canvas.width = globals.vol.nx;
         canvas.height = globals.vol.ny;
         canvas.style.display = "inline";
         if ((findEl("mod_min_threshold").value == "") || (findEl("mod_max_threshold").value == "")) {
            ui.ui_prompt("error: show histogram to find thresholds");
            return;
         };
         globals.vol.layer_size = globals.vol.size / globals.vol.nz;
         var file_reader = new FileReader();
         file_reader.onload = mod_vol_mesh_handler;
         globals.vol.stop = false;
         window.onkeydown = function(evt) {
            if (evt.keyCode == 83) globals.vol.stop = true;
         };
         globals.vol.layer = 0;
         globals.vol.ptr = 0;
         globals.vol.buf = new Array(2);
         globals.vol.buf[0] = new Float32Array(globals.vol.nx * globals.vol.ny);
         globals.vol.buf[1] = new Float32Array(globals.vol.nx * globals.vol.ny);
         globals.mesh.rules = mod_mesh_march_rules();
         globals.mesh.triangles = 0;
         var blob = globals.input_file.slice(0, globals.vol.layer_size);
         file_reader.readAsArrayBuffer(blob);
      });
      findEl('save_stl').addEventListener("click", function() {
         ui.ui_clear();
         var canvas = findEl("mod_input_canvas");
         canvas.width = globals.vol.nx;
         canvas.height = globals.vol.ny;
         canvas.style.display = "inline";
         if (globals.input_size != globals.vol.size) {
            ui.ui_prompt("error: vol size does not match file size");
            return;
         };
         if (findEl("mod_triangles").value == "") {
            ui.ui_prompt("error: show mesh to calculate number of triangles");
            return;
         };
         globals.vol.layer_size = globals.vol.size / globals.vol.nz;
         var file_reader = new FileReader();
         file_reader.onload = mod_vol_stl_handler;
         globals.vol.stop = false;
         window.onkeydown = function(evt) {
            if (evt.keyCode == 83) globals.vol.stop = true;
         };
         globals.vol.layer = 0;
         globals.vol.ptr = 0;
         globals.vol.buf = new Array(2);
         globals.vol.buf[0] = new Float32Array(globals.vol.nx * globals.vol.ny);
         globals.vol.buf[1] = new Float32Array(globals.vol.nx * globals.vol.ny);
         globals.mesh.rules = mod_mesh_march_rules();
         globals.mesh.buf = new ArrayBuffer(80 + 4 + globals.mesh.triangles * (4 * 3 * 4 + 2));
         globals.mesh.triangles = 0;
         var blob = globals.input_file.slice(0, globals.vol.layer_size);
         file_reader.readAsArrayBuffer(blob);
      });
   }
   //
   // mod_vol_density_handler
   //

   function mod_vol_density_handler(event) {
      if (findEl("mod_float32").checked)
         var buf = new Float32Array(event.target.result)
      else if (findEl("mod_int16").checked)
         var buf = new Uint16Array(event.target.result)
      var buffer = globals.vol.buf
      var nx = globals.vol.nx
      var ny = globals.vol.ny
      var nz = globals.vol.nz
      var canvas = findEl("mod_input_canvas")
      var ctx = canvas.getContext("2d")
      var img = ctx.getImageData(0, 0, canvas.width, canvas.height)
      var data = img.data
      //
      // find limits and accumulate
      //
      var vmin = 1e10
      var vmax = -1e10
      for (var row = 0; row < ny; ++row) {
         for (var col = 0; col < nx; ++col) {
            value = buf[(ny - 1 - row) * nx + col]
            if (value > vmax)
               vmax = value
            if (value < vmin)
               vmin = value
            if (value > globals.vol.vmax)
               globals.vol.vmax = value
            if (value < globals.vol.vmin)
               globals.vol.vmin = value
            buffer[(ny - 1 - row) * nx + col] += value
         }
      }
      //
      // normalize and show layer
      //
      for (var row = 0; row < ny; ++row) {
         for (var col = 0; col < nx; ++col) {
            var value = buf[(ny - 1 - row) * nx + col]
            value = Math.floor(0.5 + 255 * (value - vmin) / (vmax - vmin))
            data[(ny - 1 - row) * nx * 4 + col * 4 + 0] = value
            data[(ny - 1 - row) * nx * 4 + col * 4 + 1] = value
            data[(ny - 1 - row) * nx * 4 + col * 4 + 2] = value
            data[(ny - 1 - row) * nx * 4 + col * 4 + 3] = 255
         }
      }
      ctx.putImageData(img, 0, 0)
      //
      // increment layer
      //
      globals.vol.layer += 1
      ui.ui_prompt("layer: " + globals.vol.layer + " (s to stop)")
      findEl("mod_vmin").value = globals.vol.vmin
      findEl("mod_vmax").value = globals.vol.vmax
      if (globals.vol.stop == true) {
         ui.ui_prompt("")
         window.onkeydown = null
         return
      }
      if ((globals.vol.layer < nz)) {
         //
         // read next layer
         //
         var file_reader = new FileReader();
         file_reader.onload = mod_vol_density_handler;
         start = globals.vol.layer * globals.vol.layer_size
         end = (globals.vol.layer + 1) * globals.vol.layer_size
         var blob = globals.input_file.slice(start, end)
         file_reader.readAsArrayBuffer(blob)
      } else {
         //
         // normalize and show density map
         //
         ui.ui_prompt("")
         window.onkeydown = null
         var vmin = 1e10
         var vmax = -1e10
         for (var row = 0; row < ny; ++row) {
            for (var col = 0; col < nx; ++col) {
               var value = buffer[(ny - 1 - row) * nx + col]
               if (value > vmax)
                  vmax = value
               if (value < vmin)
                  vmin = value
            }
         }
         for (var row = 0; row < ny; ++row) {
            for (var col = 0; col < nx; ++col) {
               var value = buffer[(ny - 1 - row) * nx + col]
               value = Math.floor(0.5 + 255 * (value - vmin) / (vmax - vmin))
               data[(ny - 1 - row) * nx * 4 + col * 4 + 0] = value
               data[(ny - 1 - row) * nx * 4 + col * 4 + 1] = value
               data[(ny - 1 - row) * nx * 4 + col * 4 + 2] = value
               data[(ny - 1 - row) * nx * 4 + col * 4 + 3] = 255
            }
         }
         ctx.putImageData(img, 0, 0)
      }
   }
   //
   // mod_vol_height_handler
   //

   function mod_vol_height_handler(event) {
      if (findEl("mod_float32").checked)
         var buf = new Float32Array(event.target.result)
      else if (findEl("mod_int16").checked)
         var buf = new Uint16Array(event.target.result)
      var buffer = globals.vol.buf
      var nx = globals.vol.nx
      var ny = globals.vol.ny
      var nz = globals.vol.nz
      var canvas = findEl("mod_input_canvas")
      var ctx = canvas.getContext("2d")
      var img = ctx.getImageData(0, 0, canvas.width, canvas.height)
      var data = img.data
      var min_threshold = parseFloat(findEl("mod_min_threshold").value)
      var max_threshold = parseFloat(findEl("mod_max_threshold").value)
      //
      // accumulate
      //
      for (var row = 0; row < ny; ++row) {
         for (var col = 0; col < nx; ++col) {
            value = buf[(ny - 1 - row) * nx + col]
            if ((value > min_threshold) && (value < max_threshold))
               buffer[(ny - 1 - row) * nx + col] = globals.vol.layer
         }
      }
      //
      // normalize and show layer
      //
      for (var row = 0; row < ny; ++row) {
         for (var col = 0; col < nx; ++col) {
            var value = Math.floor(0.5 + 255 * buffer[(ny - 1 - row) * nx + col] / globals.vol.layer)
            data[(ny - 1 - row) * nx * 4 + col * 4 + 0] = value
            data[(ny - 1 - row) * nx * 4 + col * 4 + 1] = value
            data[(ny - 1 - row) * nx * 4 + col * 4 + 2] = value
            data[(ny - 1 - row) * nx * 4 + col * 4 + 3] = 255
         }
      }
      ctx.putImageData(img, 0, 0)
      //
      // increment layer
      //
      globals.vol.layer += 1
      ui.ui_prompt("layer: " + globals.vol.layer + " (s to stop)")
      if (globals.vol.stop == true) {
         ui.ui_prompt("")
         window.onkeydown = null
         return
      }
      if (globals.vol.layer < nz) {
         //
         // read next layer
         //
         var file_reader = new FileReader();
         file_reader.onload = mod_vol_height_handler;
         start = globals.vol.layer * globals.vol.layer_size
         end = (globals.vol.layer + 1) * globals.vol.layer_size
         var blob = globals.input_file.slice(start, end)
         file_reader.readAsArrayBuffer(blob)
      } else {
         ui.ui_prompt("")
         window.onkeydown = null
      }
   }
   //
   // mod_vol_histogram_handler
   //

   function mod_vol_histogram_handler(event) {
      if (findEl("mod_float32").checked)
         var buf = new Float32Array(event.target.result)
      else if (findEl("mod_int16").checked)
         var buf = new Uint16Array(event.target.result)
      var buffer = globals.vol.buf
      var nx = globals.vol.nx
      var ny = globals.vol.ny
      var nz = globals.vol.nz
      var vmin = parseFloat(findEl("mod_vmin").value)
      var vmax = parseFloat(findEl("mod_vmax").value)
      var len = buffer.length
      var layer_buffer = new Uint32Array(len)
      //
      // add layer to histogram and draw
      //
      for (var row = 0; row < ny; ++row) {
         for (var col = 0; col < nx; ++col) {
            var value = buf[(ny - 1 - row) * nx + col]
            var index = Math.floor(0.5 + (len - 1) * (value - vmin) / (vmax - vmin))
            buffer[index] += 1
            layer_buffer[index] += 1
         }
      }
      vol_view.hist_draw(layer_buffer, vmin, vmax)
      //
      // increment layer
      //
      globals.vol.layer += 1
      ui.ui_prompt("layer: " + globals.vol.layer + " (s to stop)")
      if (globals.vol.stop == true) {
         window.onkeydown = null
         return
      }
      if (globals.vol.layer < nz) {
         //
         // read next layer
         //
         var file_reader = new FileReader();
         file_reader.onload = mod_vol_histogram_handler;
         start = globals.vol.layer * globals.vol.layer_size
         end = (globals.vol.layer + 1) * globals.vol.layer_size
         var blob = globals.input_file.slice(start, end)
         file_reader.readAsArrayBuffer(blob)
      } else {
         //
         // return 
         //
         ui.ui_prompt("")
         window.onkeydown = null
         vol_view.hist_draw(buffer, vmin, vmax)
      }
   }
   //
   // mod_vol_mesh_handler
   //

   function mod_vol_mesh_handler(event) {
      if (findEl("mod_float32").checked)
         var buf = new Float32Array(event.target.result)
      else if (findEl("mod_int16").checked)
         var buf = new Uint16Array(event.target.result)
      var nx = globals.vol.nx
      var ny = globals.vol.ny
      var nz = globals.vol.nz
      var buffer = globals.vol.buf[globals.vol.ptr]
      var min_threshold = parseFloat(findEl("mod_min_threshold").value)
      var max_threshold = parseFloat(findEl("mod_max_threshold").value)
      //
      // update limits and push layer into buffer
      //
      for (var row = 0; row < ny; ++row) {
         for (var col = 0; col < nx; ++col) {
            value = buf[(ny - 1 - row) * nx + col]
            buffer[(ny - 1 - row) * nx + col] = value
         }
      }
      //
      // triangulate layer
      //
      var mesh = mod_mesh_march_triangulate(min_threshold, max_threshold, globals.vol.buf,
         globals.vol.ptr, globals.vol.nx, globals.vol.ny,
         globals.vol.nz, globals.vol.layer)
      mesh_view.mesh_draw(mesh)
      globals.mesh.triangles += mesh.length
      //
      // increment layer
      //
      globals.vol.layer += 1
      globals.vol.ptr += 1
      if (globals.vol.ptr == globals.vol.buf.length)
         globals.vol.ptr = 0
      ui.ui_prompt("layer: " + globals.vol.layer + ', left: pan, right: rotate, scroll: zoom (s to stop)')
      findEl("mod_triangles").value = globals.mesh.triangles
      if (globals.vol.stop == true) {
         ui.ui_prompt("")
         window.onkeydown = null
         return
      }
      if (globals.vol.layer <= nz) {
         //
         // read next layer
         //
         var file_reader = new FileReader();
         file_reader.onload = mod_vol_mesh_handler;
         start = globals.vol.layer * globals.vol.layer_size
         end = (globals.vol.layer + 1) * globals.vol.layer_size
         var blob = globals.input_file.slice(start, end)
         file_reader.readAsArrayBuffer(blob)
      } else {
         ui.ui_prompt("")
         window.onkeydown = null
      }
   }
   //
   // mod_vol_stl_handler
   //

   function mod_vol_stl_handler(event) {
      if (findEl("mod_float32").checked)
         var buf = new Float32Array(event.target.result)
      else if (findEl("mod_int16").checked)
         var buf = new Uint16Array(event.target.result)
      var nx = globals.vol.nx
      var ny = globals.vol.ny
      var nz = globals.vol.nz
      var buffer = globals.vol.buf[globals.vol.ptr]
      var min_threshold = parseFloat(findEl("mod_min_threshold").value)
      var max_threshold = parseFloat(findEl("mod_max_threshold").value)
      var view = new DataView(globals.mesh.buf)
      var endian = true
      //
      // update limits and push layer into buffer
      //
      for (var row = 0; row < ny; ++row) {
         for (var col = 0; col < nx; ++col) {
            value = buf[(ny - 1 - row) * nx + col]
            buffer[(ny - 1 - row) * nx + col] = value
         }
      }
      //
      // triangulate layer
      //
      var mesh = mod_mesh_march_triangulate(min_threshold, max_threshold, globals.vol.buf,
         globals.vol.ptr, globals.vol.nx, globals.vol.ny,
         globals.vol.nz, globals.vol.layer)
      //mod_mesh_draw(mesh)
      for (var t = 0; t < mesh.length; ++t) {
         var index = 80 + 4 + globals.mesh.triangles * (4 * 3 * 4 + 2)
         view.setFloat32(index + 12, mesh[t][0][0], endian)
         view.setFloat32(index + 16, mesh[t][0][1], endian)
         view.setFloat32(index + 20, mesh[t][0][2], endian)
         view.setFloat32(index + 24, mesh[t][1][0], endian)
         view.setFloat32(index + 28, mesh[t][1][1], endian)
         view.setFloat32(index + 32, mesh[t][1][2], endian)
         view.setFloat32(index + 36, mesh[t][2][0], endian)
         view.setFloat32(index + 40, mesh[t][2][1], endian)
         view.setFloat32(index + 44, mesh[t][2][2], endian)
         globals.mesh.triangles += 1
      }
      //
      // increment layer
      //
      globals.vol.layer += 1
      globals.vol.ptr += 1
      if (globals.vol.ptr == globals.vol.buf.length)
         globals.vol.ptr = 0
      ui.ui_prompt("stl layer: " + globals.vol.layer + " (s to stop)")
      //   +', left: pan, right: rotate, scroll: zoom')
      findEl("mod_triangles").value = globals.mesh.triangles
      if (globals.vol.stop == true) {
         ui.ui_prompt("")
         window.onkeydown = null
         return
      }
      if (globals.vol.layer <= nz) {
         //
         // read next layer
         //
         var file_reader = new FileReader();
         file_reader.onload = mod_vol_stl_handler;
         start = globals.vol.layer * globals.vol.layer_size
         end = (globals.vol.layer + 1) * globals.vol.layer_size
         var blob = globals.input_file.slice(start, end)
         file_reader.readAsArrayBuffer(blob)
      } else {
         ui.ui_prompt("")
         window.onkeydown = null
         view.setUint32(80, globals.mesh.triangles, endian)
         var blob = new Blob([globals.mesh.buf], {
            type: "application/octet-stream"
         });
         var download_link = findEl("mod_download")
         download_link.download = globals.input_name + ".stl"
         download_link.href = window.URL.createObjectURL(blob)
         download_link.click()
         /*
      var maxbuf = 4e8
      var len = globals.mesh.buf.byteLength
      if (len <= maxbuf) {
         var blob = new Blob([globals.mesh.buf], {type: "application/octet-stream"});
         var download_link = findEl("mod_download")
         download_link.download = globals.input_name+".stl"
         download_link.href = window.URL.createObjectURL(blob)
         download_link.click()
         }
      else {
         var start = 0
         var end = maxbuf
         var count = 0
         var blobs = []
         while (1) {
            blobs[count] = new Blob([globals.mesh.buf.slice(start,end)], {type: "application/octet-stream"});
            var download_link = findEl("mod_download")
            download_link.download = globals.input_name+"."+count+".stl"
            download_link.href = window.URL.createObjectURL(blobs[count])
            download_link.click()
            if (end == len)
               break
            start += maxbuf
            end += maxbuf
            if (end > len)
               end = len
            count += 1
            }
         }    
      */
      }
   }

   return {
      mod_load_handler: mod_load_handler
   }

});
