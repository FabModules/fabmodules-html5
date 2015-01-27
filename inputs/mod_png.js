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

//
// mod_load_handler
//   file load handler
//
function mod_load_handler() {
   var file = document.getElementById("mod_file_input")
   file.setAttribute("onchange","mod_png_read_handler()")
   }
//
// mod_png_read_handler
//    PNG read handler
//
function mod_png_read_handler(event) {
   //
   // get input file
   //
   var file_input = document.getElementById("mod_file_input")
   document.mod.input_file = file_input.files[0]
   document.mod.input_name = file_input.files[0].name
   document.mod.input_basename = mod_file_basename(document.mod.input_name)
   //
   // read as binary string
   //
   var file_reader = new FileReader()
   file_reader.onload = mod_png_binary_load_handler
   file_reader.readAsArrayBuffer(document.mod.input_file)
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
   if (!((view.getUint8(1)==80) && (view.getUint8(2)==78) && (view.getUint8(3)==71))) {
      mod_ui_prompt("error: PNG header not found")
      return
      }
   while (1) {
      var length = view.getUint32(ptr)
      ptr += 4
      var type = String.fromCharCode(view.getUint8(ptr),view.getUint8(ptr+1),
         view.getUint8(ptr+2),view.getUint8(ptr+3))
      ptr += 4
      if (type == "pHYs") {
         ppx = view.getUint32(ptr)
         ppy = view.getUint32(ptr+4)
         units = view.getUint8(ptr+8)
         }
      if (type == "IEND")
         break
      ptr += length + 4
      }
   if (units == 0) {
      mod_ui_prompt("no PNG units not found, assuming 72 DPI")
      ppx = 72*1000/25.4
      }
   document.mod.dpi = ppx*25.4/1000
   //
   // read as URL for display
   //
   var file_reader = new FileReader()
   file_reader.onload = mod_png_URL_load_handler
   file_reader.readAsDataURL(document.mod.input_file)
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
   img.setAttribute("src",event.target.result)
   img.onload = function() {
      document.mod.width = img.width
      document.mod.height = img.height
      var process_canvas = document.getElementById("mod_process_canvas")
      process_canvas.width = img.width
      process_canvas.height = img.height
      var output_canvas = document.getElementById("mod_output_canvas")
      output_canvas.width = img.width
      output_canvas.height = img.height
      var canvas = document.getElementById("mod_input_canvas")
      canvas.width = img.width
      canvas.height = img.height
      canvas.style.display = "inline"
      var ctx = canvas.getContext("2d")
      ctx.drawImage(img,0,0)
      var input_img = ctx.getImageData(0,0,canvas.width,canvas.height)
      mod_image_flatten(input_img)
      ctx.putImageData(input_img,0,0)
      controls = document.getElementById("mod_input_controls")
      controls.innerHTML = "<b>input</b><br>"
      var file_input = document.getElementById("mod_file_input")
      controls.innerHTML += "file: "+document.mod.input_name+"<br>"
      controls.innerHTML += "dpi: "
      controls.innerHTML += "<input type='text' id='mod_dpi' size='3' value="+document.mod.dpi.toFixed(3)+" onkeyup='{\
         document.mod.dpi = parseFloat(document.getElementById(\"mod_dpi\").value);\
         document.getElementById(\"mod_mm\").innerHTML = \
            (25.4*document.mod.width/document.mod.dpi).toFixed(3)+\" x \"+\
            (25.4*document.mod.height/document.mod.dpi).toFixed(3)+\" mm\";\
         document.getElementById(\"mod_in\").innerHTML = \
            (document.mod.width/document.mod.dpi).toFixed(3)+\" x \"+\
            (document.mod.height/document.mod.dpi).toFixed(3)+\" in\";\
         }'><br>"
      controls.innerHTML += "size:<br>"
      controls.innerHTML += img.width+" x "+img.height+" px<br>"
      controls.innerHTML += "<span id='mod_mm'>"+
         (25.4*document.mod.width/document.mod.dpi).toFixed(3)+" x "+
         (25.4*document.mod.height/document.mod.dpi).toFixed(3)+" mm</span><br>"
      controls.innerHTML += "<span id='mod_in'>"+
         (document.mod.width/document.mod.dpi).toFixed(3)+" x "+
         (document.mod.height/document.mod.dpi).toFixed(3)+" in</span><br>"
      controls.innerHTML += "<input type='button' value='invert image' onclick='{\
         mod_ui_clear();\
         var canvas = document.getElementById(\"mod_input_canvas\");\
         canvas.style.display = \"inline\";\
         var ctx = canvas.getContext(\"2d\");\
         var img = ctx.getImageData(0,0,canvas.width,canvas.height);\
         mod_image_invert(img);\
         ctx.putImageData(img,0,0);}'>"        
      }
   //
   // call outputs
   //
   mod_ui_prompt("output format?")
   mod_outputs()
   }

