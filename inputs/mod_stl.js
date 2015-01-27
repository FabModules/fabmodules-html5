//
// mod_stl.js
//   fab modules STL input
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
   file.setAttribute("onchange","mod_stl_read_handler()")
   }
//
// mod_stl_read_handler
//    STL read handler
//
function mod_stl_read_handler(event) {
   //
   // get input file
   //
   var file_input = document.getElementById("mod_file_input")
   document.mod.input_file = file_input.files[0]
   document.mod.input_name = file_input.files[0].name
   document.mod.input_basename = mod_file_basename(document.mod.input_name)
   //
   // read as array buffer
   //
   var file_reader = new FileReader()
   file_reader.onload = mod_stl_load_handler
   file_reader.readAsArrayBuffer(document.mod.input_file)
   }
//
// mod_stl_load_handler
//    STL load handler
//
function mod_stl_load_handler(event) {
   //
   // read mesh
   //
   mod_ui_prompt("reading STL")
   ret = mod_stl_read(event.target.result)
   if (!ret) {
      mod_ui_prompt("must be binary STL")
      return
      }
   //
   //
   // set up UI
   //
   controls = document.getElementById("mod_input_controls")
   controls.innerHTML = "<b>input</b><br>"
   controls.innerHTML += "file: "+document.mod.input_name
   controls.innerHTML += "<br>triangles: "+document.mod.mesh.length
   controls.innerHTML += "<br>xmin: "+document.mod.mesh.xmin.toFixed(3)
   controls.innerHTML += " xmax: "+document.mod.mesh.xmax.toFixed(3)
   controls.innerHTML += "<br>ymin: "+document.mod.mesh.ymin.toFixed(3)
   controls.innerHTML += " ymax: "+document.mod.mesh.ymax.toFixed(3)
   controls.innerHTML += "<br>zmin: "+document.mod.mesh.zmin.toFixed(3)
   controls.innerHTML += " zmax: "+document.mod.mesh.zmax.toFixed(3)
   controls.innerHTML += "<br>units/in: "
   document.mod.mesh.units = 1
   controls.innerHTML += "<input type='text' id='mod_units' size='3' value="+document.mod.mesh.units+" onkeyup='{\
      document.mod.mesh.units = \
         parseFloat(document.getElementById(\"mod_units\").value);\
      document.getElementById(\"mod_mm\").innerHTML = \
         (25.4*(document.mod.mesh.xmax-document.mod.mesh.xmin)/document.mod.mesh.units).toFixed(3)+\" x \"+\
         (25.4*(document.mod.mesh.ymax-document.mod.mesh.ymin)/document.mod.mesh.units).toFixed(3)+\" x \"+\
         (25.4*(document.mod.mesh.zmax-document.mod.mesh.zmin)/document.mod.mesh.units).toFixed(3)+\" mm\";\
      document.getElementById(\"mod_in\").innerHTML = \
         ((document.mod.mesh.xmax-document.mod.mesh.xmin)/document.mod.mesh.units).toFixed(3)+\" x \"+\
         ((document.mod.mesh.ymax-document.mod.mesh.ymin)/document.mod.mesh.units).toFixed(3)+\" x \"+\
         ((document.mod.mesh.zmax-document.mod.mesh.zmin)/document.mod.mesh.units).toFixed(3)+\" in\";\
      document.mod.width = Math.floor(0.5+document.mod.dpi*\
         (document.mod.mesh.xmax-document.mod.mesh.xmin)/(document.mod.mesh.s*document.mod.mesh.units));\
      document.getElementById(\"mod_px\").innerHTML = \
         \"width: \"+document.mod.width+\" px\";\
         }'>"
   controls.innerHTML += "<br><span id='mod_mm'>"+
      (25.4*(document.mod.mesh.xmax-document.mod.mesh.xmin)/document.mod.mesh.units).toFixed(3)+" x "+
      (25.4*(document.mod.mesh.ymax-document.mod.mesh.ymin)/document.mod.mesh.units).toFixed(3)+" x "+
      (25.4*(document.mod.mesh.zmax-document.mod.mesh.zmin)/document.mod.mesh.units).toFixed(3)+" mm</span>"
   controls.innerHTML += "<br><span id='mod_in'>"+
      ((document.mod.mesh.xmax-document.mod.mesh.xmin)/document.mod.mesh.units).toFixed(3)+" x "+
      ((document.mod.mesh.ymax-document.mod.mesh.ymin)/document.mod.mesh.units).toFixed(3)+" x "+
      ((document.mod.mesh.zmax-document.mod.mesh.zmin)/document.mod.mesh.units).toFixed(3)+" in</span>"
   controls.innerHTML += "<br>view z angle: "
   controls.innerHTML += "<input type='text' id='mod_rz' size='3' value='0' onkeyup='{\
      document.mod.mesh.rz = Math.PI*parseFloat(this.value)/180;\
      document.mod.mesh.draw(document.mod.mesh.s,document.mod.mesh.dx,document.mod.mesh.dy,document.mod.mesh.rx,document.mod.mesh.rz);\
      }'>"
   controls.innerHTML += "<br>view x angle: "
   controls.innerHTML += "<input type='text' id='mod_rx' size='3' value='0' onkeyup='{\
      document.mod.mesh.rx = Math.PI*parseFloat(this.value)/180;\
      document.mod.mesh.draw(document.mod.mesh.s,document.mod.mesh.dx,document.mod.mesh.dy,document.mod.mesh.rx,document.mod.mesh.rz);\
      }'>"
   controls.innerHTML += "<br>view y offset: "
   controls.innerHTML += "<input type='text' id='mod_dy' size='3' value='0' onkeyup='{\
      document.mod.mesh.dy = parseFloat(this.value);\
      document.mod.mesh.draw(document.mod.mesh.s,document.mod.mesh.dx,document.mod.mesh.dy,document.mod.mesh.rx,document.mod.mesh.rz);\
      }'>"
   controls.innerHTML += "<br>view x offset: "
   controls.innerHTML += "<input type='text' id='mod_dx' size='3' value='0' onkeyup='{\
      document.mod.mesh.dx = parseFloat(this.value);\
      document.mod.mesh.draw(document.mod.mesh.s,document.mod.mesh.dx,document.mod.mesh.dy,document.mod.mesh.rx,document.mod.mesh.rz);\
      }'>"
   controls.innerHTML += "<br>view scale: "
   controls.innerHTML += "<input type='text' id='mod_s' size='3' value='1' onkeyup='{\
      document.mod.mesh.s = parseFloat(this.value);\
      document.mod.width = Math.floor(0.5+document.mod.dpi*\
         (document.mod.mesh.xmax-document.mod.mesh.xmin)/(document.mod.mesh.s*document.mod.mesh.units));\
      document.getElementById(\"mod_px\").innerHTML = \
         \"width: \"+document.mod.width+\" px\";\
      document.mod.mesh.draw(document.mod.mesh.s,document.mod.mesh.dx,document.mod.mesh.dy,document.mod.mesh.rx,document.mod.mesh.rz);\
      }'>"
   controls.innerHTML += "<br><input type='button' value='show mesh' onclick='{\
      mod_ui_clear();\
      var label = document.getElementById(\"mod_processes_label\");\
      label.style.display = \"none\";\
      var div = document.getElementById(\"mod_output_controls\");\
      div.innerHTML = \"\";\
      var div = document.getElementById(\"mod_process_controls\");\
      div.innerHTML = \"\";\
      mod_mesh_draw(document.mod.mesh);\
      }'>"
   controls.innerHTML += "<br>dpi: "
   document.mod.dpi = 100
   controls.innerHTML += "<input type='text' id='mod_dpi' size='3' value="+document.mod.dpi+" onkeyup='{\
      document.mod.dpi = \
         parseFloat(document.getElementById(\"mod_dpi\").value);\
      document.mod.width = Math.floor(0.5+document.mod.dpi*\
         (document.mod.mesh.xmax-document.mod.mesh.xmin)/(document.mod.mesh.s*document.mod.mesh.units));\
      document.getElementById(\"mod_px\").innerHTML = \
         \"width: \"+document.mod.width+\" px\";\
      }'>"
   document.mod.width =
      (document.mod.dpi*(document.mod.mesh.xmax-document.mod.mesh.xmin)/document.mod.mesh.units).toFixed(0)
   controls.innerHTML += "<br><span id='mod_px'>"+
      "width: "+document.mod.width+" px</span>"
   controls.innerHTML += "<br><input type='button' value='calculate height map' onclick='{\
      mod_ui_clear();\
      var label = document.getElementById(\"mod_processes_label\");\
      label.style.display = \"none\";\
      var div = document.getElementById(\"mod_output_controls\");\
      div.innerHTML = \"\";\
      var div = document.getElementById(\"mod_process_controls\");\
      div.innerHTML = \"\";\
      var canvas = document.getElementById(\"mod_input_canvas\");\
      document.mod.width = Math.floor(0.5+document.mod.dpi*\
         (document.mod.mesh.xmax-document.mod.mesh.xmin)/(document.mod.mesh.s*document.mod.mesh.units));\
      document.mod.height = document.mod.width;\
      canvas.width = document.mod.width;\
      canvas.height = document.mod.width;\
      canvas.style.display = \"inline\";\
      var ctx = canvas.getContext(\"2d\");\
      var process_canvas = document.getElementById(\"mod_process_canvas\");\
      process_canvas.width = document.mod.width;\
      process_canvas.height = document.mod.width;\
      var output_canvas = document.getElementById(\"mod_output_canvas\");\
      output_canvas.width = document.mod.width;\
      output_canvas.height = document.mod.width;\
      var img = ctx.getImageData(0,0,canvas.width,canvas.height);\
      mod_mesh_height_map(document.mod.mesh,img);\
      ctx.putImageData(img,0,0);\
      mod_ui_prompt(\"\");\
      }'>"
   //
   // draw mesh
   //
   mod_mesh_draw(document.mod.mesh)
   //
   // call outputs
   //
   mod_ui_prompt("output format?")
   mod_outputs()
   }
//
// mod_stl_read
//    read mesh from STL buffer
//
function mod_stl_read(buf) {
   var endian = true
   var xmin = Number.MAX_VALUE
   var xmax = -Number.MAX_VALUE
   var ymin = Number.MAX_VALUE
   var ymax = -Number.MAX_VALUE
   var zmin = Number.MAX_VALUE
   var zmax = -Number.MAX_VALUE
   function getx() {
      var x = view.getFloat32(pos,endian)
      pos += 4
      if (x > xmax)
         xmax = x
      if (x < xmin)
         xmin = x
      return x}
   function gety() {
      var y = view.getFloat32(pos,endian)
      pos += 4
      if (y > ymax)
         ymax = y
      if (y < ymin)
         ymin = y
      return y}
   function getz() {
      var z = view.getFloat32(pos,endian)
      pos += 4
      if (z > zmax)
         zmax = z
      if (z < zmin)
         zmin = z
      return z}
   var view = new DataView(buf)
   //
   // check for binary STL
   //
   if ((view.getUint8(0) == 115) && (view.getUint8(1) == 111) && (view.getUint8(2) == 108)
      && (view.getUint8(3) == 105) && (view.getUint8(4) == 100))
      //
      // "solid" found, check if binary anyway by multiple of 50 bytes records (Solidworks hack)
      //
      if (Math.floor((view.byteLength-(80+4))/50) != ((view.byteLength-(80+4))/50))
         return false
   var ntriangles = view.getUint32(80,endian)
   var pos = 84
   document.mod.mesh = []
   for (var i = 0; i < ntriangles; ++i) {
      pos += 12
      var x0 = getx()
      var y0 = gety()
      var z0 = getz()
      var x1 = getx()
      var y1 = gety()
      var z1 = getz()
      var x2 = getx()
      var y2 = gety()
      var z2 = getz()
      document.mod.mesh[document.mod.mesh.length] = [[x0,y0,z0],[x1,y1,z1],[x2,y2,z2]]
      pos += 2
      }
   document.mod.mesh.xmin = xmin
   document.mod.mesh.xmax = xmax
   document.mod.mesh.ymin = ymin
   document.mod.mesh.ymax = ymax
   document.mod.mesh.zmin = zmin
   document.mod.mesh.zmax = zmax
   document.mod.mesh.rz = 0
   document.mod.mesh.rx = 0
   document.mod.mesh.dy = 0
   document.mod.mesh.dx = 0
   document.mod.mesh.s = 1
   return true
   }

