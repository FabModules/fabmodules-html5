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
define(['require',
   'handlebars',
   'mods/mod_ui',
   'mods/mod_globals',
   'outputs/mod_outputs',
   'mods/mod_file',
   'processes/mod_mesh',
   'processes/mod_mesh_view',
   'text!templates/mod_stl_input_controls.html'
], function(require) {

   var ui = require('mods/mod_ui');
   var Handlebars = require('handlebars');
   var globals = require('mods/mod_globals');
   var outputs = require('outputs/mod_outputs');
   var fileUtils = require('mods/mod_file');
   var meshUtils = require('processes/mod_mesh');
   var meshView = require('processes/mod_mesh_view');
   var findEl = globals.findEl;
   var mod_stl_input_controls_tpl = Handlebars.compile(require('text!templates/mod_stl_input_controls.html'));

   //
   // mod_load_handler
   //   file load handler
   //

   function mod_load_handler() {
      var file = findEl("mod_file_input")
      // file.setAttribute("onchange", "mod_stl_read_handler()")
      file.addEventListener('change', function() {
         mod_stl_read_handler();
      });
   }
   //
   // mod_stl_read_handler
   //    STL read handler
   //

   function mod_stl_read_handler(event) {
      //
      // get input file
      //
      var file_input = findEl("mod_file_input")
      globals.input_file = file_input.files[0]
      globals.input_name = file_input.files[0].name
      globals.input_basename = fileUtils.basename(globals.input_name)
      //
      // read as array buffer
      //
      var file_reader = new FileReader()
      file_reader.onload = mod_stl_load_handler
      file_reader.readAsArrayBuffer(globals.input_file)
   }
   //
   // mod_stl_load_handler
   //    STL load handler
   //

   function mod_stl_load_handler(event) {
      //
      // read mesh
      //
      ui.ui_prompt("reading STL")
      ret = mod_stl_read(event.target.result)
      if (!ret) {
         ui.ui_prompt("must be binary STL")
         return
      }

      // update globals

      globals.mesh.units = 1
      globals.dpi = 100
      globals.width = (globals.dpi * (globals.mesh.xmax - globals.mesh.xmin) / globals.mesh.units).toFixed(0)

      //
      //
      // set up UI
      //
      controls = findEl("mod_input_controls")

      /** template => mod_stl_input_controls **/

      /*
      controls.innerHTML = "<b>input</b><br>"
      controls.innerHTML += "file: " + globals.input_name
      controls.innerHTML += "<br>triangles: " + globals.mesh.length
      controls.innerHTML += "<br>xmin: " + globals.mesh.xmin.toFixed(3)
      controls.innerHTML += " xmax: " + globals.mesh.xmax.toFixed(3)
      controls.innerHTML += "<br>ymin: " + globals.mesh.ymin.toFixed(3)
      controls.innerHTML += " ymax: " + globals.mesh.ymax.toFixed(3)
      controls.innerHTML += "<br>zmin: " + globals.mesh.zmin.toFixed(3)
      controls.innerHTML += " zmax: " + globals.mesh.zmax.toFixed(3)
      controls.innerHTML += "<br>units/in: "
      controls.innerHTML += "<input type='text' id='mod_units' size='3' value=" + globals.mesh.units + ">";

      controls.innerHTML += "<br><span id='mod_mm'>" +
         (25.4 * (globals.mesh.xmax - globals.mesh.xmin) / globals.mesh.units).toFixed(3) + " x " +
         (25.4 * (globals.mesh.ymax - globals.mesh.ymin) / globals.mesh.units).toFixed(3) + " x " +
         (25.4 * (globals.mesh.zmax - globals.mesh.zmin) / globals.mesh.units).toFixed(3) + " mm</span>"
      
      controls.innerHTML += "<br><span id='mod_in'>" +
         ((globals.mesh.xmax - globals.mesh.xmin) / globals.mesh.units).toFixed(3) + " x " +
         ((globals.mesh.ymax - globals.mesh.ymin) / globals.mesh.units).toFixed(3) + " x " +
         ((globals.mesh.zmax - globals.mesh.zmin) / globals.mesh.units).toFixed(3) + " in</span>"
      
      controls.innerHTML += "<br>view z angle: "
      controls.innerHTML += "<input type='text' id='mod_rz' size='3' value='0'>";
      controls.innerHTML += "<br>view x angle: "
      controls.innerHTML += "<input type='text' id='mod_rx' size='3' value='0'>";
      controls.innerHTML += "<br>view y offset: "
      controls.innerHTML += "<input type='text' id='mod_dy' size='3' value='0'>";
      controls.innerHTML += "<br>view x offset: "
      controls.innerHTML += "<input type='text' id='mod_dx' size='3' value='0'>";
      controls.innerHTML += "<br>view scale: "
      controls.innerHTML += "<input type='text' id='mod_s' size='3' value='1'>";
      controls.innerHTML += "<br><input id='show_mesh' type='button' value='show mesh'>";
      controls.innerHTML += "<br>dpi: "
      controls.innerHTML += "<input type='text' id='mod_dpi' size='3' value=" + globals.dpi + ">";
      controls.innerHTML += "<br><span id='mod_px'>" + "width: " + globals.width + " px</span>"
      controls.innerHTML += "<br><input type='button' id='calculate_height_map' value='calculate height map'>";
      */

      ctx = {
         input_name: globals.input_name,
         mesh_length: globals.mesh.length,
         x_min: globals.mesh.xmin.toFixed(3),
         x_max: globals.mesh.xmax.toFixed(3),
         y_min: globals.mesh.ymin.toFixed(3),
         y_max: globals.mesh.ymax.toFixed(3),
         z_min: globals.mesh.zmin.toFixed(3),
         z_max: globals.mesh.zmin.toFixed(3),
         mesh_units: globals.mesh.units,
         mm_x: (25.4 * (globals.mesh.xmax - globals.mesh.xmin) / globals.mesh.units).toFixed(3),
         mm_y: (25.4 * (globals.mesh.ymax - globals.mesh.ymin) / globals.mesh.units).toFixed(3),
         mm_z: (25.4 * (globals.mesh.zmax - globals.mesh.zmin) / globals.mesh.units).toFixed(3),
         in_x: ((globals.mesh.xmax - globals.mesh.xmin) / globals.mesh.units).toFixed(3),
         in_y: ((globals.mesh.ymax - globals.mesh.ymin) / globals.mesh.units).toFixed(3),
         in_z: ((globals.mesh.zmax - globals.mesh.zmin) / globals.mesh.units).toFixed(3),
         dpi: globals.dpi,
         width: globals.width
      }
      
      controls.innerHTML = mod_stl_input_controls_tpl(ctx);

      // event handlers

      findEl("mod_units").addEventListener("keyup", function() {

         globals.mesh.units = parseFloat(findEl("mod_units").value);

         findEl("mod_mm").innerHTML =
            (25.4 * (globals.mesh.xmax - globals.mesh.xmin) / globals.mesh.units).toFixed(3) + " x " +
            (25.4 * (globals.mesh.ymax - globals.mesh.ymin) / globals.mesh.units).toFixed(3) + " x " +
            (25.4 * (globals.mesh.zmax - globals.mesh.zmin) / globals.mesh.units).toFixed(3) + " mm";

         findEl("mod_in").innerHTML =
            ((globals.mesh.xmax - globals.mesh.xmin) / globals.mesh.units).toFixed(3) + " x " +
            ((globals.mesh.ymax - globals.mesh.ymin) / globals.mesh.units).toFixed(3) + " x " +
            ((globals.mesh.zmax - globals.mesh.zmin) / globals.mesh.units).toFixed(3) + " in";

         globals.width = Math.floor(0.5 + globals.dpi * (globals.mesh.xmax - globals.mesh.xmin) / (globals.mesh.s * globals.mesh.units));

         findEl("mod_px").innerHTML = "width: " + globals.width + " px";

      });

      findEl("mod_rz").addEventListener("keyup", function() {
         globals.mesh.rz = Math.PI * parseFloat(this.value) / 180;
         globals.mesh.draw(globals.mesh.s, globals.mesh.dx, globals.mesh.dy, globals.mesh.rx, globals.mesh.rz);
      });

      findEl("mod_rx").addEventListener("keyup", function() {
         globals.mesh.rx = Math.PI * parseFloat(this.value) / 180;
         globals.mesh.draw(globals.mesh.s, globals.mesh.dx, globals.mesh.dy, globals.mesh.rx, globals.mesh.rz);
      });

      findEl("mod_dy").addEventListener("keyup", function() {
         globals.mesh.dy = parseFloat(this.value);
         globals.mesh.draw(globals.mesh.s, globals.mesh.dx, globals.mesh.dy, globals.mesh.rx, globals.mesh.rz);
      });

      findEl("mod_dx").addEventListener("keyup", function() {
         globals.mesh.dx = parseFloat(this.value);
         globals.mesh.draw(globals.mesh.s, globals.mesh.dx, globals.mesh.dy, globals.mesh.rx, globals.mesh.rz);
      });

      findEl("mod_s").addEventListener("keyup", function() {
         globals.mesh.s = parseFloat(this.value);
         globals.width = Math.floor(0.5 + globals.dpi * (globals.mesh.xmax - globals.mesh.xmin) / (globals.mesh.s * globals.mesh.units));
         findEl("mod_px").innerHTML = "width: " + globals.width + " px";
         globals.mesh.draw(globals.mesh.s, globals.mesh.dx, globals.mesh.dy, globals.mesh.rx, globals.mesh.rz);
      });

      findEl('show_mesh').addEventListener("click", function() {
         ui.ui_clear();
         var label = findEl("mod_processes_label");
         label.style.display = "none";
         var div = findEl("mod_output_controls");
         div.innerHTML = "";
         var div = findEl("mod_process_controls");
         div.innerHTML = "";
         meshView.mesh_draw(globals.mesh);
      });


      findEl("mod_dpi").addEventListener("keyup", function() {
         globals.dpi = parseFloat(findEl("mod_dpi").value);
         globals.width = Math.floor(0.5 + globals.dpi * (globals.mesh.xmax - globals.mesh.xmin) / (globals.mesh.s * globals.mesh.units));
         findEl("mod_px").innerHTML = "width: " + globals.width + " px";
      });


      findEl('calculate_height_map').addEventListener("click", function() {
         ui.ui_clear();
         var label = findEl("mod_processes_label");
         label.style.display = "none";
         var div = findEl("mod_output_controls");
         div.innerHTML = "";
         var div = findEl("mod_process_controls");
         div.innerHTML = "";
         var canvas = findEl("mod_input_canvas");
         globals.width = Math.floor(0.5 + globals.dpi * (globals.mesh.xmax - globals.mesh.xmin) / (globals.mesh.s * globals.mesh.units));
         globals.height = globals.width;
         canvas.width = globals.width;
         canvas.height = globals.width;
         canvas.style.display = "inline";
         var ctx = canvas.getContext("2d");
         var process_canvas = findEl("mod_process_canvas");
         process_canvas.width = globals.width;
         process_canvas.height = globals.width;
         var output_canvas = findEl("mod_output_canvas");
         output_canvas.width = globals.width;
         output_canvas.height = globals.width;
         var img = ctx.getImageData(0, 0, canvas.width, canvas.height);
         meshUtils.height_map(globals.mesh, img);
         ctx.putImageData(img, 0, 0);
         ui.ui_prompt("");
      });

      //
      // draw mesh
      //
      meshView.mesh_draw(globals.mesh)
      //
      // call outputs
      //
      ui.ui_prompt("output format?")
      outputs.init()
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
            var x = view.getFloat32(pos, endian)
            pos += 4
            if (x > xmax)
               xmax = x
            if (x < xmin)
               xmin = x
            return x
         }

         function gety() {
            var y = view.getFloat32(pos, endian)
            pos += 4
            if (y > ymax)
               ymax = y
            if (y < ymin)
               ymin = y
            return y
         }

         function getz() {
            var z = view.getFloat32(pos, endian)
            pos += 4
            if (z > zmax)
               zmax = z
            if (z < zmin)
               zmin = z
            return z
         }
      var view = new DataView(buf)
      //
      // check for binary STL
      //
      if ((view.getUint8(0) == 115) && (view.getUint8(1) == 111) && (view.getUint8(2) == 108) && (view.getUint8(3) == 105) && (view.getUint8(4) == 100))
      //
      // "solid" found, check if binary anyway by multiple of 50 bytes records (Solidworks hack)
      //
         if (Math.floor((view.byteLength - (80 + 4)) / 50) != ((view.byteLength - (80 + 4)) / 50))
            return false
      var ntriangles = view.getUint32(80, endian)
      var pos = 84
      globals.mesh = []
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
         globals.mesh[globals.mesh.length] = [
            [x0, y0, z0],
            [x1, y1, z1],
            [x2, y2, z2]
         ]
         pos += 2
      }
      globals.mesh.xmin = xmin
      globals.mesh.xmax = xmax
      globals.mesh.ymin = ymin
      globals.mesh.ymax = ymax
      globals.mesh.zmin = zmin
      globals.mesh.zmax = zmax
      globals.mesh.rz = 0
      globals.mesh.rx = 0
      globals.mesh.dy = 0
      globals.mesh.dx = 0
      globals.mesh.s = 1
      return true
   }


   return {
      mod_load_handler: mod_load_handler
   }
});
