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

//
// load viewer routines
//
var script = document.createElement("script")
script.type = "text/javascript"
script.src = "inputs/mod_vol_view.js"
document.body.appendChild(script)
//
// mod_load_handler
//   file load handler
//
function mod_load_handler() {
   var file = document.getElementById("mod_file_input")
   file.setAttribute("onchange","mod_vol_read_handler()")
   }
//
// mod_vol_read_handler
//    .vol read handler
//
function mod_vol_read_handler(event) {
   document.mod.vol = {}
   //
   // get input file info
   //
   var file_input = document.getElementById("mod_file_input")
   document.mod.input_file = file_input.files[0]
   document.mod.input_size = file_input.files[0].size
   document.mod.input_name = file_input.files[0].name
   document.mod.input_basename = mod_file_basename(document.mod.input_name)
   //
   // set up UI
   //
   document.mod.mesh.rz = 0
   document.mod.mesh.rx = 0
   document.mod.mesh.dy = 0
   document.mod.mesh.dx = 0
   document.mod.mesh.s = 1
   controls = document.getElementById("mod_input_controls")
   controls.innerHTML = "<b>input</b><br>"
   controls.innerHTML += "file: "+document.mod.input_name+"<br>"
   controls.innerHTML += "file size: "+document.mod.input_size+"<br>"
   controls.innerHTML += "type: "
   document.mod.vol.bytes = 4
   controls.innerHTML += "float 32 <input type='radio' name='mod_units' id='mod_float32' checked onchange='{\
      if (document.getElementById(\"mod_float32\").checked)\
         document.mod.vol.bytes = 4;\
      else if (document.getElementById(\"mod_int16\").checked)\
         document.mod.vol.bytes = 2;\
      document.mod.vol.size = \
         document.mod.vol.bytes*document.mod.vol.nx*document.mod.vol.ny*document.mod.vol.nz;\
      document.getElementById(\"mod_size\").innerHTML = document.mod.vol.size;\
      }'> "
   controls.innerHTML += "int 16 <input type='radio' name='mod_units' id='mod_int16' onchange='{\
      if (document.getElementById(\"mod_float32\").checked)\
         document.mod.vol.bytes = 4;\
      else if (document.getElementById(\"mod_int16\").checked)\
         document.mod.vol.bytes = 2;\
      document.mod.vol.size = \
         document.mod.vol.bytes*document.mod.vol.nx*document.mod.vol.ny*document.mod.vol.nz;\
      document.getElementById(\"mod_size\").innerHTML = document.mod.vol.size;\
      }'><br>"
   document.mod.vol.nx = 1
   controls.innerHTML += "nx: <input type='text' id='mod_nx' size='3' value='1' onkeyup='{\
      document.mod.vol.nx = parseInt(document.getElementById(\"mod_nx\").value);\
      document.mod.vol.size = \
         document.mod.vol.bytes*document.mod.vol.nx*document.mod.vol.ny*document.mod.vol.nz;\
      document.getElementById(\"mod_size\").innerHTML = document.mod.vol.size;\
      }'><br>"
   document.mod.vol.ny = 1
   controls.innerHTML += "ny: <input type='text' id='mod_ny' size='3' value='1' onkeyup='{\
      document.mod.vol.ny = parseInt(document.getElementById(\"mod_ny\").value);\
      document.mod.vol.size = \
         document.mod.vol.bytes*document.mod.vol.nx*document.mod.vol.ny*document.mod.vol.nz;\
      document.getElementById(\"mod_size\").innerHTML = document.mod.vol.size;\
      }'><br>"
   document.mod.vol.nz = 1
   controls.innerHTML += "nz: <input type='text' id='mod_nz' size='3' value='1' onkeyup='{\
      document.mod.vol.nz = parseInt(document.getElementById(\"mod_nz\").value);\
      document.mod.vol.size = \
         document.mod.vol.bytes*document.mod.vol.nx*document.mod.vol.ny*document.mod.vol.nz;\
      document.getElementById(\"mod_size\").innerHTML = document.mod.vol.size;\
      }'><br>"
   document.mod.vol.size = 4
   controls.innerHTML += "vol size: <span id='mod_size'>4</span><br>"
   //controls.innerHTML += "voxel size (um): <input type='text' id='mod_size' size='3' value='1'><br>"
   controls.innerHTML += "<input type='button' value='show density' onclick='{\
      mod_ui_clear();\
      var canvas = document.getElementById(\"mod_input_canvas\");\
      canvas.width = document.mod.vol.nx;\
      canvas.height = document.mod.vol.ny;\
      canvas.style.display = \"inline\";\
      if (document.mod.input_size != document.mod.vol.size) {\
         mod_ui_prompt(\"error: vol size does not match file size\");\
         return;\
         };\
      document.mod.vol.layer_size = document.mod.vol.size/document.mod.vol.nz;\
      var file_reader = new FileReader();\
      file_reader.onload = mod_vol_density_handler;\
      document.mod.vol.stop = false;\
      window.onkeydown = function(evt){if (evt.keyCode == 83) document.mod.vol.stop = true;};\
      document.mod.vol.layer = 0;\
      document.mod.vol.vmax = -1e10;\
      document.mod.vol.vmin = 1e10;\
      document.mod.vol.buf = new Float32Array(document.mod.vol.nx*document.mod.vol.ny);\
      var blob = document.mod.input_file.slice(0,document.mod.vol.layer_size);\
      file_reader.readAsArrayBuffer(blob);\
      }'><br>"
   controls.innerHTML += "min value: <input type='text' id='mod_vmin' size='3' value=''><br>"
   controls.innerHTML += "max value: <input type='text' id='mod_vmax' size='3' value=''><br>"
   controls.innerHTML += "<input type='button' value='show histogram' onclick='{\
      var nhist = 100;\
      mod_ui_clear();\
      var canvas = document.getElementById(\"mod_input_canvas\");\
      canvas.width = document.mod.vol.nx;\
      canvas.height = document.mod.vol.ny;\
      canvas.style.display = \"inline\";\
      if ((document.getElementById(\"mod_vmin\").value == \"\")\
       || (document.getElementById(\"mod_vmax\").value == \"\")) {\
         mod_ui_prompt(\"error: show density to find limits\");\
         return;\
         };\
      document.mod.vol.layer_size = document.mod.vol.size/document.mod.vol.nz;\
      var file_reader = new FileReader();\
      file_reader.onload = mod_vol_histogram_handler;\
      document.mod.vol.stop = false;\
      window.onkeydown = function(evt){if (evt.keyCode == 83) document.mod.vol.stop = true;};\
      document.mod.vol.hmax = -1e10;\
      document.mod.vol.layer = 0;\
      document.mod.vol.buf = new Uint32Array(nhist);\
      var blob = document.mod.input_file.slice(0,document.mod.vol.layer_size);\
      file_reader.readAsArrayBuffer(blob);\
      }'><br>"
   controls.innerHTML += "min threshold: <input type='text' id='mod_min_threshold' size='3' value=''><br>"
   controls.innerHTML += "max threshold: <input type='text' id='mod_max_threshold' size='3' value=''><br>"
   controls.innerHTML += "<input type='button' value='show height' onclick='{\
      mod_ui_clear();\
      var canvas = document.getElementById(\"mod_input_canvas\");\
      canvas.width = document.mod.vol.nx;\
      canvas.height = document.mod.vol.ny;\
      canvas.style.display = \"inline\";\
      if ((document.getElementById(\"mod_min_threshold\").value == \"\")\
       || (document.getElementById(\"mod_max_threshold\").value == \"\")) {\
         mod_ui_prompt(\"error: show histogram to find thresholds\");\
         return;\
         };\
      document.mod.vol.layer_size = document.mod.vol.size/document.mod.vol.nz;\
      var file_reader = new FileReader();\
      file_reader.onload = mod_vol_height_handler;\
      document.mod.vol.stop = false;\
      window.onkeydown = function(evt){if (evt.keyCode == 83) document.mod.vol.stop = true;};\
      document.mod.vol.layer = 0;\
      document.mod.vol.buf = new Uint16Array(document.mod.vol.nx*document.mod.vol.ny);\
      var blob = document.mod.input_file.slice(0,document.mod.vol.layer_size);\
      file_reader.readAsArrayBuffer(blob);\
      }'><br>"
   controls.innerHTML += "<input type='button' value='show mesh' onclick='{\
      mod_ui_clear();\
      var canvas = document.getElementById(\"mod_input_canvas\");\
      canvas.width = document.mod.vol.nx;\
      canvas.height = document.mod.vol.ny;\
      canvas.style.display = \"inline\";\
      if ((document.getElementById(\"mod_min_threshold\").value == \"\")\
       || (document.getElementById(\"mod_max_threshold\").value == \"\")) {\
         mod_ui_prompt(\"error: show histogram to find thresholds\");\
         return;\
         };\
      document.mod.vol.layer_size = document.mod.vol.size/document.mod.vol.nz;\
      var file_reader = new FileReader();\
      file_reader.onload = mod_vol_mesh_handler;\
      document.mod.vol.stop = false;\
      window.onkeydown = function(evt){if (evt.keyCode == 83) document.mod.vol.stop = true;};\
      document.mod.vol.layer = 0;\
      document.mod.vol.ptr = 0;\
      document.mod.vol.buf = new Array(2);\
      document.mod.vol.buf[0] = new Float32Array(document.mod.vol.nx*document.mod.vol.ny);\
      document.mod.vol.buf[1] = new Float32Array(document.mod.vol.nx*document.mod.vol.ny);\
      document.mod.mesh.rules = mod_mesh_march_rules();\
      document.mod.mesh.triangles = 0;\
      var blob = document.mod.input_file.slice(0,document.mod.vol.layer_size);\
      file_reader.readAsArrayBuffer(blob);\
      }'><br>"
   controls.innerHTML += "triangles: <input type='text' id='mod_triangles' size='8' value=''><br>"
   controls.innerHTML += "<input type='button' value='save .stl' onclick='{\
      mod_ui_clear();\
      var canvas = document.getElementById(\"mod_input_canvas\");\
      canvas.width = document.mod.vol.nx;\
      canvas.height = document.mod.vol.ny;\
      canvas.style.display = \"inline\";\
      if (document.mod.input_size != document.mod.vol.size) {\
         mod_ui_prompt(\"error: vol size does not match file size\");\
         return;\
         };\
      if (document.getElementById(\"mod_triangles\").value == \"\") {\
         mod_ui_prompt(\"error: show mesh to calculate number of triangles\");\
         return;\
         };\
      document.mod.vol.layer_size = document.mod.vol.size/document.mod.vol.nz;\
      var file_reader = new FileReader();\
      file_reader.onload = mod_vol_stl_handler;\
      document.mod.vol.stop = false;\
      window.onkeydown = function(evt){if (evt.keyCode == 83) document.mod.vol.stop = true;};\
      document.mod.vol.layer = 0;\
      document.mod.vol.ptr = 0;\
      document.mod.vol.buf = new Array(2);\
      document.mod.vol.buf[0] = new Float32Array(document.mod.vol.nx*document.mod.vol.ny);\
      document.mod.vol.buf[1] = new Float32Array(document.mod.vol.nx*document.mod.vol.ny);\
      document.mod.mesh.rules = mod_mesh_march_rules();\
      document.mod.mesh.buf = new ArrayBuffer(80+4+document.mod.mesh.triangles*(4*3*4+2));\
      document.mod.mesh.triangles = 0;\
      var blob = document.mod.input_file.slice(0,document.mod.vol.layer_size);\
      file_reader.readAsArrayBuffer(blob);\
      }'><br>"
   }
//
// mod_vol_density_handler
//
function mod_vol_density_handler(event) {
   if (document.getElementById("mod_float32").checked)
      var buf = new Float32Array(event.target.result)
   else if (document.getElementById("mod_int16").checked)
      var buf = new Uint16Array(event.target.result)
   var buffer = document.mod.vol.buf
   var nx = document.mod.vol.nx
   var ny = document.mod.vol.ny
   var nz = document.mod.vol.nz
   var canvas = document.getElementById("mod_input_canvas")
   var ctx = canvas.getContext("2d")
   var img = ctx.getImageData(0,0,canvas.width,canvas.height)
   var data = img.data
   //
   // find limits and accumulate
   //
   var vmin = 1e10
   var vmax = -1e10
   for (var row = 0; row < ny; ++row) {
      for (var col = 0; col < nx; ++col) {
         value = buf[(ny-1-row)*nx+col]
         if (value > vmax)
            vmax = value
         if (value < vmin)
            vmin = value
         if (value > document.mod.vol.vmax)
            document.mod.vol.vmax = value
         if (value < document.mod.vol.vmin)
            document.mod.vol.vmin = value
         buffer[(ny-1-row)*nx+col] += value
         }
      }
   //
   // normalize and show layer
   //
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
   ctx.putImageData(img,0,0)
   //
   // increment layer
   //
   document.mod.vol.layer += 1
   mod_ui_prompt("layer: "+document.mod.vol.layer+" (s to stop)")
   document.getElementById("mod_vmin").value = document.mod.vol.vmin
   document.getElementById("mod_vmax").value = document.mod.vol.vmax
   if (document.mod.vol.stop == true) {
      mod_ui_prompt("")
      window.onkeydown = null
      return
      }
   if ((document.mod.vol.layer < nz)) {
      //
      // read next layer
      //
      var file_reader = new FileReader();
      file_reader.onload = mod_vol_density_handler;
      start = document.mod.vol.layer*document.mod.vol.layer_size
      end = (document.mod.vol.layer+1)*document.mod.vol.layer_size
      var blob = document.mod.input_file.slice(start,end)
      file_reader.readAsArrayBuffer(blob)
      }
   else {
      //
      // normalize and show density map
      //
      mod_ui_prompt("")
      window.onkeydown = null
      var vmin = 1e10
      var vmax = -1e10
      for (var row = 0; row < ny; ++row) {
         for (var col = 0; col < nx; ++col) {
            var value = buffer[(ny-1-row)*nx+col]
            if (value > vmax)
               vmax = value
            if (value < vmin)
               vmin = value
            }
         }
      for (var row = 0; row < ny; ++row) {
         for (var col = 0; col < nx; ++col) {
            var value = buffer[(ny-1-row)*nx+col]
            value = Math.floor(0.5+255*(value-vmin)/(vmax-vmin))
            data[(ny-1-row)*nx*4+col*4+0] = value
            data[(ny-1-row)*nx*4+col*4+1] = value
            data[(ny-1-row)*nx*4+col*4+2] = value
            data[(ny-1-row)*nx*4+col*4+3] = 255
            }
         }
      ctx.putImageData(img,0,0)
      }
   }
//
// mod_vol_height_handler
//
function mod_vol_height_handler(event) {
   if (document.getElementById("mod_float32").checked)
      var buf = new Float32Array(event.target.result)
   else if (document.getElementById("mod_int16").checked)
      var buf = new Uint16Array(event.target.result)
   var buffer = document.mod.vol.buf
   var nx = document.mod.vol.nx
   var ny = document.mod.vol.ny
   var nz = document.mod.vol.nz
   var canvas = document.getElementById("mod_input_canvas")
   var ctx = canvas.getContext("2d")
   var img = ctx.getImageData(0,0,canvas.width,canvas.height)
   var data = img.data
   var min_threshold = parseFloat(document.getElementById("mod_min_threshold").value)
   var max_threshold = parseFloat(document.getElementById("mod_max_threshold").value)
   //
   // accumulate
   //
   for (var row = 0; row < ny; ++row) {
      for (var col = 0; col < nx; ++col) {
         value = buf[(ny-1-row)*nx+col]
         if ((value > min_threshold) && (value < max_threshold))
            buffer[(ny-1-row)*nx+col] = document.mod.vol.layer
         }
      }
   //
   // normalize and show layer
   //
   for (var row = 0; row < ny; ++row) {
      for (var col = 0; col < nx; ++col) {
         var value = Math.floor(0.5+255*buffer[(ny-1-row)*nx+col]/document.mod.vol.layer)
         data[(ny-1-row)*nx*4+col*4+0] = value
         data[(ny-1-row)*nx*4+col*4+1] = value
         data[(ny-1-row)*nx*4+col*4+2] = value
         data[(ny-1-row)*nx*4+col*4+3] = 255
         }
      }
   ctx.putImageData(img,0,0)
   //
   // increment layer
   //
   document.mod.vol.layer += 1
   mod_ui_prompt("layer: "+document.mod.vol.layer+" (s to stop)")
   if (document.mod.vol.stop == true) {
      mod_ui_prompt("")
      window.onkeydown = null
      return
      }
   if (document.mod.vol.layer < nz) {
      //
      // read next layer
      //
      var file_reader = new FileReader();
      file_reader.onload = mod_vol_height_handler;
      start = document.mod.vol.layer*document.mod.vol.layer_size
      end = (document.mod.vol.layer+1)*document.mod.vol.layer_size
      var blob = document.mod.input_file.slice(start,end)
      file_reader.readAsArrayBuffer(blob)
      }
   else {
      mod_ui_prompt("")
      window.onkeydown = null
      }
   }
//
// mod_vol_histogram_handler
//
function mod_vol_histogram_handler(event) {
   if (document.getElementById("mod_float32").checked)
      var buf = new Float32Array(event.target.result)
   else if (document.getElementById("mod_int16").checked)
      var buf = new Uint16Array(event.target.result)
   var buffer = document.mod.vol.buf
   var nx = document.mod.vol.nx
   var ny = document.mod.vol.ny
   var nz = document.mod.vol.nz
   var vmin = parseFloat(document.getElementById("mod_vmin").value)
   var vmax = parseFloat(document.getElementById("mod_vmax").value)
   var len = buffer.length
   var layer_buffer = new Uint32Array(len)
   //
   // add layer to histogram and draw
   //
   for (var row = 0; row < ny; ++row) {
      for (var col = 0; col < nx; ++col) {
         var value = buf[(ny-1-row)*nx+col]
         var index = Math.floor(0.5+(len-1)*(value-vmin)/(vmax-vmin))
         buffer[index] += 1
         layer_buffer[index] += 1
         }
      }
   mod_vol_hist_draw(layer_buffer,vmin,vmax)
   //
   // increment layer
   //
   document.mod.vol.layer += 1
   mod_ui_prompt("layer: "+document.mod.vol.layer+" (s to stop)")
   if (document.mod.vol.stop == true) {
      window.onkeydown = null
      return
      }
   if (document.mod.vol.layer < nz) {
      //
      // read next layer
      //
      var file_reader = new FileReader();
      file_reader.onload = mod_vol_histogram_handler;
      start = document.mod.vol.layer*document.mod.vol.layer_size
      end = (document.mod.vol.layer+1)*document.mod.vol.layer_size
      var blob = document.mod.input_file.slice(start,end)
      file_reader.readAsArrayBuffer(blob)
      }
   else {
      //
      // return 
      //
      mod_ui_prompt("")
      window.onkeydown = null
      mod_vol_hist_draw(buffer,vmin,vmax)
      }
   }
//
// mod_vol_mesh_handler
//
function mod_vol_mesh_handler(event) {
   if (document.getElementById("mod_float32").checked)
      var buf = new Float32Array(event.target.result)
   else if (document.getElementById("mod_int16").checked)
      var buf = new Uint16Array(event.target.result)
   var nx = document.mod.vol.nx
   var ny = document.mod.vol.ny
   var nz = document.mod.vol.nz
   var buffer = document.mod.vol.buf[document.mod.vol.ptr]
   var min_threshold = parseFloat(document.getElementById("mod_min_threshold").value)
   var max_threshold = parseFloat(document.getElementById("mod_max_threshold").value)
   //
   // update limits and push layer into buffer
   //
   for (var row = 0; row < ny; ++row) {
      for (var col = 0; col < nx; ++col) {
         value = buf[(ny-1-row)*nx+col]
         buffer[(ny-1-row)*nx+col] = value
         }
      }
   //
   // triangulate layer
   //
   var mesh = mod_mesh_march_triangulate(min_threshold,max_threshold,document.mod.vol.buf,
      document.mod.vol.ptr,document.mod.vol.nx,document.mod.vol.ny,
      document.mod.vol.nz,document.mod.vol.layer)
   mod_mesh_draw(mesh)
   document.mod.mesh.triangles += mesh.length
   //
   // increment layer
   //
   document.mod.vol.layer += 1
   document.mod.vol.ptr += 1
   if (document.mod.vol.ptr == document.mod.vol.buf.length)
      document.mod.vol.ptr = 0
   mod_ui_prompt("layer: "+document.mod.vol.layer
      +', left: pan, right: rotate, scroll: zoom (s to stop)')
   document.getElementById("mod_triangles").value = document.mod.mesh.triangles
   if (document.mod.vol.stop == true) {
      mod_ui_prompt("")
      window.onkeydown = null
      return
      }
   if (document.mod.vol.layer <= nz) {
      //
      // read next layer
      //
      var file_reader = new FileReader();
      file_reader.onload = mod_vol_mesh_handler;
      start = document.mod.vol.layer*document.mod.vol.layer_size
      end = (document.mod.vol.layer+1)*document.mod.vol.layer_size
      var blob = document.mod.input_file.slice(start,end)
      file_reader.readAsArrayBuffer(blob)
      }
   else {
      mod_ui_prompt("")
      window.onkeydown = null
      }
   }
//
// mod_vol_stl_handler
//
function mod_vol_stl_handler(event) {
   if (document.getElementById("mod_float32").checked)
      var buf = new Float32Array(event.target.result)
   else if (document.getElementById("mod_int16").checked)
      var buf = new Uint16Array(event.target.result)
   var nx = document.mod.vol.nx
   var ny = document.mod.vol.ny
   var nz = document.mod.vol.nz
   var buffer = document.mod.vol.buf[document.mod.vol.ptr]
   var min_threshold = parseFloat(document.getElementById("mod_min_threshold").value)
   var max_threshold = parseFloat(document.getElementById("mod_max_threshold").value)
   var view = new DataView(document.mod.mesh.buf)
   var endian = true
   //
   // update limits and push layer into buffer
   //
   for (var row = 0; row < ny; ++row) {
      for (var col = 0; col < nx; ++col) {
         value = buf[(ny-1-row)*nx+col]
         buffer[(ny-1-row)*nx+col] = value
         }
      }
   //
   // triangulate layer
   //
   var mesh = mod_mesh_march_triangulate(min_threshold,max_threshold,document.mod.vol.buf,
      document.mod.vol.ptr,document.mod.vol.nx,document.mod.vol.ny,
      document.mod.vol.nz,document.mod.vol.layer)
   //mod_mesh_draw(mesh)
   for (var t = 0; t < mesh.length; ++t) {
      var index = 80+4+document.mod.mesh.triangles*(4*3*4+2)
      view.setFloat32(index+12,mesh[t][0][0],endian)
      view.setFloat32(index+16,mesh[t][0][1],endian)
      view.setFloat32(index+20,mesh[t][0][2],endian)
      view.setFloat32(index+24,mesh[t][1][0],endian)
      view.setFloat32(index+28,mesh[t][1][1],endian)
      view.setFloat32(index+32,mesh[t][1][2],endian)
      view.setFloat32(index+36,mesh[t][2][0],endian)
      view.setFloat32(index+40,mesh[t][2][1],endian)
      view.setFloat32(index+44,mesh[t][2][2],endian)
      document.mod.mesh.triangles += 1
      }
   //
   // increment layer
   //
   document.mod.vol.layer += 1
   document.mod.vol.ptr += 1
   if (document.mod.vol.ptr == document.mod.vol.buf.length)
      document.mod.vol.ptr = 0
   mod_ui_prompt("stl layer: "+document.mod.vol.layer+" (s to stop)")
   //   +', left: pan, right: rotate, scroll: zoom')
   document.getElementById("mod_triangles").value = document.mod.mesh.triangles
   if (document.mod.vol.stop == true) {
      mod_ui_prompt("")
      window.onkeydown = null
      return
      }
   if (document.mod.vol.layer <= nz) {
      //
      // read next layer
      //
      var file_reader = new FileReader();
      file_reader.onload = mod_vol_stl_handler;
      start = document.mod.vol.layer*document.mod.vol.layer_size
      end = (document.mod.vol.layer+1)*document.mod.vol.layer_size
      var blob = document.mod.input_file.slice(start,end)
      file_reader.readAsArrayBuffer(blob)
      }
   else {
      mod_ui_prompt("")
      window.onkeydown = null
      view.setUint32(80,document.mod.mesh.triangles,endian)
      var blob = new Blob([document.mod.mesh.buf], {type: "application/octet-stream"});
      var download_link = document.getElementById("mod_download")
      download_link.download = document.mod.input_name+".stl"
      download_link.href = window.URL.createObjectURL(blob)
      download_link.click()
      /*
      var maxbuf = 4e8
      var len = document.mod.mesh.buf.byteLength
      if (len <= maxbuf) {
         var blob = new Blob([document.mod.mesh.buf], {type: "application/octet-stream"});
         var download_link = document.getElementById("mod_download")
         download_link.download = document.mod.input_name+".stl"
         download_link.href = window.URL.createObjectURL(blob)
         download_link.click()
         }
      else {
         var start = 0
         var end = maxbuf
         var count = 0
         var blobs = []
         while (1) {
            blobs[count] = new Blob([document.mod.mesh.buf.slice(start,end)], {type: "application/octet-stream"});
            var download_link = document.getElementById("mod_download")
            download_link.download = document.mod.input_name+"."+count+".stl"
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

