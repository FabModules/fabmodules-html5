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

var MAXWIDTH = 10000

//
// mod_load_handler
//   file load handler
//
function mod_load_handler() {
   var file = document.getElementById("mod_file_input")
   file.setAttribute("onchange","mod_svg_read_handler()")
   }
//
// mod_svg_read_handler
//    SVG read handler
//
function mod_svg_read_handler(event) {
   //
   // get input file
   //
   var file_input = document.getElementById("mod_file_input")
   document.mod.input_file = file_input.files[0]
   document.mod.input_name = file_input.files[0].name
   document.mod.input_basename = mod_file_basename(document.mod.input_name)
   //
   // read as text
   //
   var file_reader = new FileReader()
   file_reader.onload = mod_svg_text_load_handler
   file_reader.readAsText(document.mod.input_file)
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
      mod_ui_prompt("error: SVG width not found")
      return
      }
   var i1 = str.indexOf("\"",i+1)
   var i2 = str.indexOf("\"",i1+1)
   var width = str.substring(i1+1,i2)
   i = str.indexOf("height")
   i1 = str.indexOf("\"",i+1)
   i2 = str.indexOf("\"",i1+1)
   var height = str.substring(i1+1,i2)
   ih = str.indexOf("height")
   if (width.indexOf("px") != -1) {
      width = width.slice(0,-2)
      height = height.slice(0,-2)
      var units = 90
      }
   else if (width.indexOf("mm") != -1) {
      width = width.slice(0,-2)
      height = height.slice(0,-2)
      var units = 25.4
      }
   else if (width.indexOf("cm") != -1) {
      width = width.slice(0,-2)
      height = height.slice(0,-2)
      var units = 2.54
      }
   else if (width.indexOf("in") != -1) {
      width = width.slice(0,-2)
      height = height.slice(0,-2)
      var units = 1
      }
   else {
      var units = 90
      }
   document.mod.dpi = 300
   document.mod.svg = {}
   document.mod.svg.units = units
   document.mod.svg.width = parseFloat(width)
   document.mod.svg.height = parseFloat(height)
   document.mod.width = parseInt(document.mod.dpi*width/units)
   document.mod.height = parseInt(document.mod.dpi*height/units)
   //
   // read as URL for display
   //
   var file_reader = new FileReader()
   file_reader.onload = mod_svg_URL_load_handler
   file_reader.readAsDataURL(document.mod.input_file)
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
   img.setAttribute("src",event.target.result)
   document.mod.svg.svg = event.target.result
   img.onload = function() {
      img.width = document.mod.width
      img.height = document.mod.height
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
      ctx.drawImage(img,0,0,img.width,img.height)
      var input_img = ctx.getImageData(0,0,canvas.width,canvas.height)
      mod_image_flatten(input_img)
      ctx.putImageData(input_img,0,0)
      controls = document.getElementById("mod_input_controls")
      controls.innerHTML = "<b>input</b><br>"
      var file_input = document.getElementById("mod_file_input")
      controls.innerHTML += "file: "+document.mod.input_name+"<br>"
      controls.innerHTML += "units/in: "
      controls.innerHTML += "<input type='text' id='mod_units' size='3' value="+document.mod.svg.units.toFixed(3)+" onkeyup='{\
         document.mod.svg.units = \
            parseFloat(document.getElementById(\"mod_units\").value);\
         document.mod.width = \
            parseInt(document.mod.dpi*document.mod.svg.width/document.mod.svg.units);\
         document.mod.height = \
            parseInt(document.mod.dpi*document.mod.svg.height/document.mod.svg.units);\
         document.getElementById(\"mod_px\").innerHTML = \
            document.mod.width+\" x \"+document.mod.height+\" px\";\
         document.getElementById(\"mod_mm\").innerHTML = \
            (25.4*document.mod.width/document.mod.dpi).toFixed(3)+\" x \"+\
            (25.4*document.mod.height/document.mod.dpi).toFixed(3)+\" mm\";\
         document.getElementById(\"mod_in\").innerHTML = \
            (document.mod.width/document.mod.dpi).toFixed(3)+\" x \"+\
            (document.mod.height/document.mod.dpi).toFixed(3)+\" in\";\
         mod_svg_reload();\
         }'><br>"
      controls.innerHTML += "width: "+document.mod.svg.width.toFixed(3)+"<br>"
      controls.innerHTML += "height: "+document.mod.svg.height.toFixed(3)+"<br>"
      controls.innerHTML += "dpi: "
      controls.innerHTML += "<input type='text' id='mod_dpi' size='3' value="+document.mod.dpi.toFixed(3)+" onkeyup='{\
         document.mod.dpi = \
            parseFloat(document.getElementById(\"mod_dpi\").value);\
         document.mod.width = \
            parseInt(document.mod.dpi*document.mod.svg.width/document.mod.svg.units);\
         document.mod.height = \
            parseInt(document.mod.dpi*document.mod.svg.height/document.mod.svg.units);\
         document.getElementById(\"mod_px\").innerHTML = \
            document.mod.width+\" x \"+document.mod.height+\" px\";\
         mod_svg_reload();\
         }'><br>"
      controls.innerHTML += "size:<br>"
      controls.innerHTML += "<span id='mod_px'>"+
         document.mod.width+" x "+document.mod.height+" px</span><br>"
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
//
// mod_svg_reload
//    reload SVG image
//
function mod_svg_reload() {
   mod_ui_clear()
   var img = new Image()
   img.setAttribute("src",document.mod.svg.svg)
   if (document.mod.width > MAXWIDTH) {
      mod_ui_prompt("error: image too large (greater than mod_svg MAXWIDTH)")
      return
      }
   else
      mod_ui_prompt("")
   img.onload = function() {
      img.width = document.mod.width
      img.height = document.mod.height
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
      ctx.drawImage(img,0,0,img.width,img.height)
      var input_img = ctx.getImageData(0,0,canvas.width,canvas.height)
      mod_image_flatten(input_img)
      ctx.putImageData(input_img,0,0)
      }
   }

