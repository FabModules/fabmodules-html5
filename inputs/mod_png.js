//
// mod_png.js
//   fab modules PNG input
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
   'processes/mod_image',
   'text!templates/mod_png_input_controls.html'
], function(require) {

   var Handlebars = require('handlebars');
   var ui = require('mods/mod_ui');
   var globals = require('mods/mod_globals');
   var outputs = require('outputs/mod_outputs');
   var file = require('mods/mod_file');
   var imageUtils = require('processes/mod_image');
   var input_controls_tpl = Handlebars.compile(require('text!templates/mod_png_input_controls.html'));
   var findEl = globals.findEl;


   //
   // mod_load_handler
   //   file load handler
   //

   function mod_load_handler() {
      var file = findEl("mod_file_input")
      // file.setAttribute("onchange","mod_png_read_handler()")
      file.addEventListener("change", mod_png_read_handler);
   }
   //
   // mod_png_read_handler
   //    PNG read handler
   //

   function mod_png_read_handler(event) {
      //
      // get input file
      //
      var file_input = findEl("mod_file_input")
      globals.input_file = file_input.files[0]
      globals.input_name = file_input.files[0].name
      globals.input_basename = file.basename(globals.input_name)
      //
      // read as binary string
      //
      var file_reader = new FileReader()
      file_reader.onload = mod_png_binary_load_handler
      file_reader.readAsArrayBuffer(globals.input_file)
   }
   //
   // mod_png_binary_load_handler
   //    PNG binary load handler
   //

   function mod_png_binary_load_handler(event) {
      //
      // get DPI
      //
      // 8 header
      // 4 len, 4 type, data, 4 crc
      // pHYs 4 ppx, 4 ppy, 1 unit: 0 ?, 1 meter
      // IEND
      //
      var units = ppx = ppy = 0
      var buf = event.target.result
      var view = new DataView(buf)
      var ptr = 8
      if (!((view.getUint8(1) == 80) && (view.getUint8(2) == 78) && (view.getUint8(3) == 71))) {
         ui.ui_prompt("error: PNG header not found")
         return
      }
      while (1) {
         var length = view.getUint32(ptr)
         ptr += 4
         var type = String.fromCharCode(view.getUint8(ptr), view.getUint8(ptr + 1),
            view.getUint8(ptr + 2), view.getUint8(ptr + 3))
         ptr += 4
         if (type == "pHYs") {
            ppx = view.getUint32(ptr)
            ppy = view.getUint32(ptr + 4)
            units = view.getUint8(ptr + 8)
         }
         if (type == "IEND")
            break
         ptr += length + 4
      }
      if (units == 0) {
         ui.ui_prompt("no PNG units not found, assuming 72 DPI")
         ppx = 72 * 1000 / 25.4
      }
      globals.dpi = ppx * 25.4 / 1000
      //
      // read as URL for display
      //
      var file_reader = new FileReader()
      file_reader.onload = mod_png_URL_load_handler
      file_reader.readAsDataURL(globals.input_file)
   }
   //
   // mod_png_URL_load_handler
   //    PNG URL load handler
   //

   function mod_png_URL_load_handler(event) {
      //
      // read and display image
      //
      var img = new Image()
      img.setAttribute("src", event.target.result)
      img.onload = function() {
         globals.width = img.width
         globals.height = img.height
         var process_canvas = findEl("mod_process_canvas")
         process_canvas.width = img.width
         process_canvas.height = img.height
         var output_canvas = findEl("mod_output_canvas")
         output_canvas.width = img.width
         output_canvas.height = img.height
         var canvas = findEl("mod_input_canvas")
         canvas.width = img.width
         canvas.height = img.height
         canvas.style.display = "inline"
         var ctx = canvas.getContext("2d")
         ctx.drawImage(img, 0, 0)
         var input_img = ctx.getImageData(0, 0, canvas.width, canvas.height)
         imageUtils.flatten(input_img)
         ctx.putImageData(input_img, 0, 0)

         controls = findEl("mod_input_controls")

         /** template => mod_png_input_controls **/
         ctx = {
            input_name: globals.input_name,
            dpi: globals.dpi.toFixed(3),
            img_width: img.width,
            img_height: img.height,
            mm_w: (25.4 * globals.width / globals.dpi).toFixed(3),
            mm_h: (25.4 * globals.height / globals.dpi).toFixed(3),
            in_w: (globals.width / globals.dpi).toFixed(3),
            in_h: (globals.height / globals.dpi).toFixed(3)
         }
         // controls.innerHTML = "<b>input</b><br>"
         // controls.innerHTML += "file: " + globals.input_name + "<br>"
         // controls.innerHTML += "dpi: "
         // controls.innerHTML += "<input type='text' id='mod_dpi' size='3' value=" + globals.dpi.toFixed(3) + ">";
         // controls.innerHTML += "<br>";
         // controls.innerHTML += "size:<br>"
         // controls.innerHTML += img.width + " x " + img.height + " px<br>"
         // controls.innerHTML += "<span id='mod_mm'>" +
         //    (25.4 * globals.width / globals.dpi).toFixed(3) + " x " +
         //    (25.4 * globals.height / globals.dpi).toFixed(3) + " mm</span><br>"
         // controls.innerHTML += "<span id='mod_in'>" +
         //    (globals.width / globals.dpi).toFixed(3) + " x " +
         //    (globals.height / globals.dpi).toFixed(3) + " in</span><br>"
         // controls.innerHTML += "<input type='button' value='invert image' id='invert_image_btn'>";

         //console.log(input_controls_tpl(ctx))

         controls.innerHTML = input_controls_tpl(ctx);

         var file_input = findEl("mod_file_input")
         findEl("mod_dpi").addEventListener("keyup", function() {
            globals.dpi = parseFloat(findEl("mod_dpi").value);
            findEl("mod_mm").innerHTML = (25.4 * globals.width / globals.dpi).toFixed(3) + " x " + (25.4 * globals.height / globals.dpi).toFixed(3) + " mm";
            findEl("mod_in").innerHTML = (globals.width / globals.dpi).toFixed(3) + " x " + (globals.height / globals.dpi).toFixed(3) + " in";
         });

         findEl('invert_image_btn').addEventListener("click", function() {
            ui.ui_clear();
            var canvas = findEl("mod_input_canvas");
            canvas.style.display = "inline";
            var ctx = canvas.getContext("2d");
            var img = ctx.getImageData(0, 0, canvas.width, canvas.height);
            imageUtils.invert(img);
            ctx.putImageData(img, 0, 0);
         });
      }
      //
      // call outputs
      //
      ui.ui_prompt("output format?")
      // mod_outputs()
      outputs.init();
   }

   return {
      mod_load_handler: mod_load_handler
   };

});
