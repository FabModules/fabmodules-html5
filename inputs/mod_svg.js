//
// mod_svg.js
//   fab modules SVG input
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
   'text!templates/mod_svg_input_controls.html',
], function(require) {

   var ui = require('mods/mod_ui');
   var Handlebars = require('handlebars');
   var globals = require('mods/mod_globals');
   var outputs = require('outputs/mod_outputs');
   var fileUtils = require('mods/mod_file');
   var imageUtils = require('processes/mod_image')
   var findEl = globals.findEl;
   var mod_svg_input_controls_tpl = Handlebars.compile(require('text!templates/mod_svg_input_controls.html'));
   var MAXWIDTH = 10000

   //
   // mod_load_handler
   //   file load handler
   //

      function mod_load_handler() {
         var file = findEl("mod_file_input")
         // file.setAttribute("onchange","mod_svg_read_handler()")
         file.addEventListener("change", function() {
            mod_svg_read_handler();
         });
      }
      //
      // mod_svg_read_handler
      //    SVG read handler
      //

      function mod_svg_read_handler(event) {
         //
         // get input file
         //
         var file_input = findEl("mod_file_input")
         globals.input_file = file_input.files[0]
         globals.input_name = file_input.files[0].name
         globals.input_basename = fileUtils.basename(globals.input_name)
         //
         // read as text
         //
         var file_reader = new FileReader()
         file_reader.onload = mod_svg_text_load_handler
         file_reader.readAsText(globals.input_file)
      }
      //
      // mod_svg_text_load_handler
      //    SVG text load handler
      //

      function mod_svg_text_load_handler(event) {
         //
         // get size
         //
         str = event.target.result
         var i = str.indexOf("width")
         if (i == -1) {
            ui.ui_prompt("error: SVG width not found")
            return
         }
         var i1 = str.indexOf("\"", i + 1)
         var i2 = str.indexOf("\"", i1 + 1)
         var width = str.substring(i1 + 1, i2)
         i = str.indexOf("height")
         i1 = str.indexOf("\"", i + 1)
         i2 = str.indexOf("\"", i1 + 1)
         var height = str.substring(i1 + 1, i2)
         ih = str.indexOf("height")
         if (width.indexOf("px") != -1) {
            width = width.slice(0, -2)
            height = height.slice(0, -2)
            var units = 90
         } else if (width.indexOf("mm") != -1) {
            width = width.slice(0, -2)
            height = height.slice(0, -2)
            var units = 25.4
         } else if (width.indexOf("cm") != -1) {
            width = width.slice(0, -2)
            height = height.slice(0, -2)
            var units = 2.54
         } else if (width.indexOf("in") != -1) {
            width = width.slice(0, -2)
            height = height.slice(0, -2)
            var units = 1
         } else {
            var units = 90
         }
         globals.dpi = 300
         globals.svg = {}
         globals.svg.units = units
         globals.svg.width = parseFloat(width)
         globals.svg.height = parseFloat(height)
         globals.width = parseInt(globals.dpi * width / units)
         globals.height = parseInt(globals.dpi * height / units)
         //
         // read as URL for display
         //
         var file_reader = new FileReader()
         file_reader.onload = mod_svg_URL_load_handler
         file_reader.readAsDataURL(globals.input_file)
      }
      //
      // mod_svg_URL_load_handler
      //    SVG URL load handler
      //

      function mod_svg_URL_load_handler(event) {
         //
         // read and display image
         //
         var img = new Image()
         img.setAttribute("src", event.target.result)
         globals.svg.svg = event.target.result
         img.onload = function() {
            img.width = globals.width
            img.height = globals.height
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
            ctx.drawImage(img, 0, 0, img.width, img.height)
            var input_img = ctx.getImageData(0, 0, canvas.width, canvas.height)
            imageUtils.flatten(input_img)
            ctx.putImageData(input_img, 0, 0)
            var file_input = findEl("mod_file_input")

            controls = findEl("mod_input_controls")

            /** template => mod_svg_input_controls **/

            /*
            controls.innerHTML = "<b>input</b><br>"
            controls.innerHTML += "file: " + globals.input_name + "<br>"
            controls.innerHTML += "units/in: "
            controls.innerHTML += "<input type='text' id='mod_units' size='3' value=" + globals.svg.units.toFixed(3) + ">";

            controls.innerHTML += "<br>";
            controls.innerHTML += "width: " + globals.svg.width.toFixed(3) + "<br>"
            controls.innerHTML += "height: " + globals.svg.height.toFixed(3) + "<br>"
            controls.innerHTML += "dpi: "
            controls.innerHTML += "<input type='text' id='mod_dpi' size='3' value=" + globals.dpi.toFixed(3) + ">";
            controls.innerHTML += "<br>";
            controls.innerHTML += "size:<br>"
            controls.innerHTML += "<span id='mod_px'>" +
               globals.width + " x " + globals.height + " px</span><br>"
            controls.innerHTML += "<span id='mod_mm'>" +
               (25.4 * globals.width / globals.dpi).toFixed(3) + " x " +
               (25.4 * globals.height / globals.dpi).toFixed(3) + " mm</span><br>"
            controls.innerHTML += "<span id='mod_in'>" +
               (globals.width / globals.dpi).toFixed(3) + " x " +
               (globals.height / globals.dpi).toFixed(3) + " in</span><br>"
            controls.innerHTML += "<input type='button' id='invert_image' value='invert image'>";*/

            ctx = {
               input_name: globals.input_name,
               units: globals.svg.units.toFixed(3),
               width: globals.svg.width.toFixed(3),
               height: globals.svg.height.toFixed(3),
               dpi: globals.dpi.toFixed(3),
               px_w: globals.width,
               px_h: globals.height,
               mm_w: (25.4 * globals.width / globals.dpi).toFixed(3),
               mm_h: (25.4 * globals.height / globals.dpi).toFixed(3),
               in_w: (globals.width / globals.dpi).toFixed(3),
               in_h: (globals.height / globals.dpi).toFixed(3)
            }
            controls.innerHTML = mod_svg_input_controls_tpl(ctx);



            findEl("mod_units").addEventListener("keyup", function() {
               globals.svg.units = parseFloat(findEl("mod_units").value);
               globals.width = parseInt(globals.dpi * globals.svg.width / globals.svg.units);
               globals.height = parseInt(globals.dpi * globals.svg.height / globals.svg.units);
               findEl("mod_px").innerHTML = globals.width + " x " + globals.height + " px";
               findEl("mod_mm").innerHTML = (25.4 * globals.width / globals.dpi).toFixed(3) + " x " + (25.4 * globals.height / globals.dpi).toFixed(3) + " mm";
               findEl("mod_in").innerHTML = (globals.width / globals.dpi).toFixed(3) + " x " + (globals.height / globals.dpi).toFixed(3) + " in";
               mod_svg_reload();
            });

            findEl("mod_dpi").addEventListener("keyup", function() {
               globals.dpi = parseFloat(findEl("mod_dpi").value);
               globals.width = parseInt(globals.dpi * globals.svg.width / globals.svg.units);
               globals.height = parseInt(globals.dpi * globals.svg.height / globals.svg.units);
               findEl("mod_px").innerHTML = globals.width + " x " + globals.height + " px";
               mod_svg_reload();
            });

            findEl('invert_image').addEventListener("click", function() {
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
         outputs.init()
      }
      //
      // mod_svg_reload
      //    reload SVG image
      //

      function mod_svg_reload() {
         ui.ui_clear()
         var img = new Image()
         img.setAttribute("src", globals.svg.svg)
         if (globals.width > MAXWIDTH) {
            ui.ui_prompt("error: image too large (greater than mod_svg MAXWIDTH)")
            return
         } else
            ui.ui_prompt("")
         img.onload = function() {
            img.width = globals.width
            img.height = globals.height
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
            ctx.drawImage(img, 0, 0, img.width, img.height)
            var input_img = ctx.getImageData(0, 0, canvas.width, canvas.height)
            imageUtils.flatten(input_img)
            ctx.putImageData(input_img, 0, 0)
         }
      }


   return {
      mod_load_handler: mod_load_handler
   }


});
