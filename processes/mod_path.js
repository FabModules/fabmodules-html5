//
// mod_path.js
//   fab modules path calculation routines
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
// defines
//
var X = 0
var Y = 1
var Z = 2

//
// mod_path_file_controls
//    path file save and send controls
//
function mod_path_file_controls(routine) {
   controls = document.getElementById("mod_process_controls")
   controls.innerHTML += "&nbsp;<input type='button' id='mod_save' value='save'\
      onclick='{\
         if (document.mod.path == undefined) {\
            mod_ui_prompt(\"path not calculated\");}\
         else {\
            var file = "+routine+"(document.mod.path);\
            var name = document.mod.input_basename+document.mod.type;\
            mod_file_save(name,file);}\
         }'>"
   controls.innerHTML += "&nbsp;<input type='button' id='mod_send' value='send'\
      onclick='{\
         if (document.mod.path == undefined) {\
            mod_ui_prompt(\"path not calculated\");}\
         else {\
            var file = "+routine+"(document.mod.path);\
            var name = document.mod.input_basename+document.mod.type;\
            var command = document.getElementById(\"mod_command\").value;\
            var server = document.getElementById(\"mod_server\").value;\
            mod_file_send(name,file,command,server);}\
         }'>"
   controls.innerHTML += "<br>send command:"
   controls.innerHTML += "<br>&nbsp;&nbsp;&nbsp;<input type='text' id='mod_command' value=''>" 
   controls.innerHTML += "<br>send server:"
   controls.innerHTML += "<br>&nbsp;&nbsp;&nbsp;<input type='text' id='mod_server' value='"+document.mod.server+"'>" 
   }
//
// mod_path_image_2D
//    path from image 2D (intensity)
//
function mod_path_image_2D() {
   //
   // clear display
   //
   mod_ui_clear()
   mod_ui_prompt('calculating path')
   //
   // get images
   //
   var input_canvas = document.getElementById("mod_input_canvas")
   var process_canvas = document.getElementById("mod_process_canvas")
   var output_canvas = document.getElementById("mod_output_canvas")
   var input_ctx = input_canvas.getContext("2d")
   var input_img = input_ctx.getImageData(0,0,input_canvas.width,input_canvas.height)
   var process_ctx = process_canvas.getContext("2d")
   process_ctx.drawImage(input_canvas,0,0)
   var process_img = process_ctx.getImageData(0,0,process_canvas.width,process_canvas.height)
   var output_ctx = output_canvas.getContext("2d")
   var output_img = output_ctx.getImageData(0,0,output_canvas.width,output_canvas.height)
   //
   // get arguments
   //
   var threshold = parseFloat(document.getElementById("mod_threshold").value)
   var number = parseInt(document.getElementById("mod_offsets").value)
   var diameter = parseFloat(document.getElementById("mod_diameter").value)
   var overlap = parseFloat(document.getElementById("mod_overlap").value)
   var error = parseFloat(document.getElementById("mod_error").value)
   var direction = true
   var sorting = document.getElementById("mod_sort").checked
   var sort_merge = parseFloat(document.getElementById("mod_merge").value)
   var sort_order = parseFloat(document.getElementById("mod_order").value)
   var sort_sequence = parseFloat(document.getElementById("mod_sequence").value)
   //
   // set up path Web worker
   //
   var worker = new Worker('processes/mod_path_worker.js')
   var path = []
   worker.addEventListener('message',function(e){
      if (e.data[0] == 'prompt')
         //
         // prompt message from worker
         //
         mod_ui_prompt(e.data[1])
      else if (e.data[0] == 'console')
         //
         // console message from worker
         //
         console.log(e.data[1])
      else if (e.data[0] == 'path') {
         //
         // partial path message from worker
         //
         path = e.data[1]
         //
         // show path
         //
         mod_path_show_gl(path)
         }
      else if (e.data[0] == 'return') {
         //
         // complete path message from worker
         //
         path = e.data[1]
         //
         // call continue event
         //
         var event = new Event('continue_2D') 
         dispatchEvent(event)
         }
      },false)
   //
   // add continue event
   //
   addEventListener('continue_2D',function(e){
      //
      // show path
      //
      mod_path_show_gl(path)
      //
      // add path to DOM
      //
      document.mod.path = path
      //
      // terminate worker
      //
      worker.terminate()
      },false)
   //
   // start worker
   //
   worker.postMessage(["mod_path_worker_image_2D_calculate",process_img,output_img,
      threshold,number,diameter,overlap,error,direction,sorting,sort_merge,sort_order,sort_sequence,document.mod.dpi])
   }
//
// mod_path_image_2D_controls
//    path from image 2D controls (intensity)
//
function mod_path_image_2D_controls(routine) {
   var controls = document.getElementById("mod_process_controls")
   controls.innerHTML = "<br><b>process</b>"
   controls.innerHTML += "<br><input type='button' id='mod_path' value='calculate'\
      onclick='mod_path_image_2D()'>"
   mod_path_file_controls(routine)
   controls.innerHTML += "<br>tool diameter (mm):"
   controls.innerHTML += "<br>&nbsp;&nbsp;&nbsp;<input type='text' id='mod_diameter' size=3 value='1'>" 
   controls.innerHTML += "<br>number of offsets (-1 to fill):"
   controls.innerHTML += "<br>&nbsp;&nbsp;&nbsp;<input type='text' id='mod_offsets' size=3 value='1'>" 
   controls.innerHTML += "<br>offset overlap (%):"
   controls.innerHTML += "<br>&nbsp;&nbsp;&nbsp;<input type='text' id='mod_overlap' size=3 value='50'>"
   controls.innerHTML += "<br>path error (pixels):"
   controls.innerHTML += "<br>&nbsp;&nbsp;&nbsp;<input type='text' id='mod_error' size=3 value='1.5'>" 
   controls.innerHTML += "<br>image threshold (0-1):"
   controls.innerHTML += "<br>&nbsp;&nbsp;&nbsp;<input type='text' id='mod_threshold' size=3 value='.5'>"
   controls.innerHTML += "<br>sort path: <input type='checkbox' id='mod_sort' checked>"
   controls.innerHTML += "<br>sort merge diameter multiple:"
   controls.innerHTML += "<br>&nbsp;&nbsp;&nbsp;<input type='text' id='mod_merge' size=3 value='1.1'>"
   controls.innerHTML += "<br>sort order weight:"
   controls.innerHTML += "<br>&nbsp;&nbsp;&nbsp;< 0: boundaries last"
   controls.innerHTML += "<br>&nbsp;&nbsp;&nbsp;= 0: min distance"
   controls.innerHTML += "<br>&nbsp;&nbsp;&nbsp;> 0: boundaries first"
   controls.innerHTML += "<br>&nbsp;&nbsp;&nbsp;<input type='text' id='mod_order' size=3 value='-1'>"
   controls.innerHTML += "<br>sort sequence weight:"
   controls.innerHTML += "<br>&nbsp;&nbsp;&nbsp;< 0: exterior last"
   controls.innerHTML += "<br>&nbsp;&nbsp;&nbsp;= 0: min distance"
   controls.innerHTML += "<br>&nbsp;&nbsp;&nbsp;> 0: exterior first"
   controls.innerHTML += "<br>&nbsp;&nbsp;&nbsp;<input type='text' id='mod_sequence' size=3 value='-1'>"
   }
//
// mod_path_image_21D
//    path from image 2.1D (intensity, depth)
//
function mod_path_image_21D() {
   //
   // clear display
   //
   mod_ui_clear()
   mod_ui_prompt('calculating path')
   //
   // get images
   //
   var input_canvas = document.getElementById("mod_input_canvas")
   var process_canvas = document.getElementById("mod_process_canvas")
   var output_canvas = document.getElementById("mod_output_canvas")
   var input_ctx = input_canvas.getContext("2d")
   var input_img = input_ctx.getImageData(0,0,input_canvas.width,input_canvas.height)
   var process_ctx = process_canvas.getContext("2d")
   process_ctx.drawImage(input_canvas,0,0)
   var process_img = process_ctx.getImageData(0,0,process_canvas.width,process_canvas.height)
   var output_ctx = output_canvas.getContext("2d")
   var output_img = output_ctx.getImageData(0,0,output_canvas.width,output_canvas.height)
   //
   // get arguments
   //
   var threshold = parseFloat(document.getElementById("mod_threshold").value)
   var number = parseInt(document.getElementById("mod_offsets").value)
   var diameter = parseFloat(document.getElementById("mod_diameter").value)
   var overlap = parseFloat(document.getElementById("mod_overlap").value)
   var error = parseFloat(document.getElementById("mod_error").value)
   var direction = document.getElementById("mod_climb").checked
   var sorting = document.getElementById("mod_sort").checked
   var sort_merge = parseFloat(document.getElementById("mod_merge").value)
   var sort_order = parseFloat(document.getElementById("mod_order").value)
   var sort_sequence = parseFloat(document.getElementById("mod_sequence").value)
   //
   // set up path Web worker
   //
   var worker = new Worker('processes/mod_path_worker.js')
   var path2 = []
   worker.addEventListener('message',function(e){
      if (e.data[0] == 'prompt')
         //
         // prompt message from worker
         //
         mod_ui_prompt(e.data[1])
      else if (e.data[0] == 'console')
         //
         // console message from worker
         //
         console.log(e.data[1])
      else if (e.data[0] == 'path') {
         //
         // partial path message from worker
         //
         path = e.data[1]
         //
         // show path
         //
         mod_path_show_gl(path)
         }
      else if (e.data[0] == 'return') {
         //
         // path message from worker
         //
         path2 = e.data[1]
         //
         // call continue event
         //
         var event = new Event('continue_21D') 
         dispatchEvent(event)
         }
      },false)
   //
   // add continue event
   //
   addEventListener('continue_21D',function(e){
      //
      // set z
      //
      var depth = parseFloat(document.getElementById("mod_depth").value)
      var idepth = Math.floor(0.5+document.mod.dpi*depth/25.4)
      var path3 = []
      for (var seg = 0; seg < path2.length; ++seg) {
         path3[path3.length] = []
         for (var pt = 0; pt < path2[seg].length; ++pt) {
            path3[path3.length-1][path3[path3.length-1].length]
               = [path2[seg][pt][X],path2[seg][pt][Y],-idepth]
            }
         }
      //
      // show path
      //
      mod_path_show_gl(path3)
      //
      // add path to DOM
      //
      document.mod.path = path3
      //
      // terminate worker
      //
      worker.terminate()
      },false)
   //
   // start worker
   //
   worker.postMessage(["mod_path_worker_image_2D_calculate",process_img,output_img,
      threshold,number,diameter,overlap,error,direction,sorting,sort_merge,sort_order,sort_sequence,document.mod.dpi])
   }
//
// mod_path_image_21D_controls
//    path from image 2.1D controls (intensity, depth)
//
function mod_path_image_21D_controls(routine) {
   var controls = document.getElementById("mod_process_controls")
   controls.innerHTML = "<br><b>process</b>"
   controls.innerHTML += "<br><input type='button' id='mod_path' value='calculate'\
      onclick='mod_path_image_21D()'>"
   mod_path_file_controls(routine)
   controls.innerHTML += "<br>direction:"
   controls.innerHTML += "<br>&nbsp;&nbsp;&nbsp;conventional <input type='radio' name='origin' id='mod_conventional'> climb <input type='radio' name='origin' id='mod_climb' checked>"
   controls.innerHTML += "<br>cut depth (mm):"
   controls.innerHTML += "<br>&nbsp;&nbsp;&nbsp;<input type='text' id='mod_depth' size='3' value='3.175'>"
   controls.innerHTML += "<br>tool diameter (mm): "
   controls.innerHTML += "<br>&nbsp;&nbsp;&nbsp;<input type='text' id='mod_diameter' size=3 value='1'>" 
   controls.innerHTML += "<br>number of offsets (-1 to fill): "
   controls.innerHTML += "<br>&nbsp;&nbsp;&nbsp;<input type='text' id='mod_offsets' size=3 value='1'>" 
   controls.innerHTML += "<br>offset overlap (%): "
   controls.innerHTML += "<br>&nbsp;&nbsp;&nbsp;<input type='text' id='mod_overlap' size=3 value='50'>"
   controls.innerHTML += "<br>path error (pixels): "
   controls.innerHTML += "<br>&nbsp;&nbsp;&nbsp;<input type='text' id='mod_error' size=3 value='1.5'>" 
   controls.innerHTML += "<br>image threshold (0-1): "
   controls.innerHTML += "<br>&nbsp;&nbsp;&nbsp;<input type='text' id='mod_threshold' size=3 value='.5'>"
   controls.innerHTML += "<br>sort path: <input type='checkbox' id='mod_sort' checked>"
   controls.innerHTML += "<br>sort merge diameter multiple: "
   controls.innerHTML += "<br>&nbsp;&nbsp;&nbsp;<input type='text' id='mod_merge' size=3 value='1.1'>"
   controls.innerHTML += "<br>sort order weight:"
   controls.innerHTML += "<br>&nbsp;&nbsp;&nbsp;< 0: boundaries last"
   controls.innerHTML += "<br>&nbsp;&nbsp;&nbsp;= 0: min distance"
   controls.innerHTML += "<br>&nbsp;&nbsp;&nbsp;> 0: boundaries first"
   controls.innerHTML += "<br>&nbsp;&nbsp;&nbsp;<input type='text' id='mod_order' size=3 value='-1'>"
   controls.innerHTML += "<br>sort sequence weight:"
   controls.innerHTML += "<br>&nbsp;&nbsp;&nbsp;< 0: exterior last"
   controls.innerHTML += "<br>&nbsp;&nbsp;&nbsp;= 0: min distance"
   controls.innerHTML += "<br>&nbsp;&nbsp;&nbsp;> 0: exterior first"
   controls.innerHTML += "<br>&nbsp;&nbsp;&nbsp;<input type='text' id='mod_sequence' size=3 value='-1'>"
   }
//
// mod_path_image_22D
//    path from image 2.2D (intensity, depth, thickness)
//
function mod_path_image_22D() {
   //
   // clear display
   //
   mod_ui_clear()
   mod_ui_prompt('calculating path')
   //
   // get images
   //
   var input_canvas = document.getElementById("mod_input_canvas")
   var process_canvas = document.getElementById("mod_process_canvas")
   var output_canvas = document.getElementById("mod_output_canvas")
   var input_ctx = input_canvas.getContext("2d")
   var input_img = input_ctx.getImageData(0,0,input_canvas.width,input_canvas.height)
   var process_ctx = process_canvas.getContext("2d")
   process_ctx.drawImage(input_canvas,0,0)
   var process_img = process_ctx.getImageData(0,0,process_canvas.width,process_canvas.height)
   var output_ctx = output_canvas.getContext("2d")
   var output_img = output_ctx.getImageData(0,0,output_canvas.width,output_canvas.height)
   //
   // get arguments
   //
   var threshold = parseFloat(document.getElementById("mod_threshold").value)
   var number = parseInt(document.getElementById("mod_offsets").value)
   var diameter = parseFloat(document.getElementById("mod_diameter").value)
   var overlap = parseFloat(document.getElementById("mod_overlap").value)
   var error = parseFloat(document.getElementById("mod_error").value)
   var direction = document.getElementById("mod_climb").checked
   var sorting = document.getElementById("mod_sort").checked
   var sort_merge = parseFloat(document.getElementById("mod_merge").value)
   var sort_order = parseFloat(document.getElementById("mod_order").value)
   var sort_sequence = parseFloat(document.getElementById("mod_sequence").value)
   //
   // set up path Web worker
   //
   var worker = new Worker('processes/mod_path_worker.js')
   var path2 = []
   worker.addEventListener('message',function(e){
      if (e.data[0] == 'prompt')
         //
         // prompt message from worker
         //
         mod_ui_prompt(e.data[1])
      else if (e.data[0] == 'console')
         //
         // console message from worker
         //
         console.log(e.data[1])
      else if (e.data[0] == 'path') {
         //
         // partial path message from worker
         //
         path = e.data[1]
         //
         // show path
         //
         mod_path_show_gl(path)
         }
      else if (e.data[0] == 'image') {
         //
         // image (debugging) message from worker
         //
         img = e.data[1]
         mod_ui_clear()
         canvas = document.getElementById("mod_output_canvas")
         canvas.width = img.width
         canvas.height = img.height
         canvas.style.display = "inline"
         var ctx = canvas.getContext("2d")
         ctx.putImageData(img,0,0)
         }
      else if (e.data[0] == 'return') {
         //
         // path message from worker
         //
         if (e.data[1] != -1) {
            //
            // path returned, call continue event
            //
            path2 = e.data[1]
            var event = new Event('continue_22D') 
            dispatchEvent(event)
            }
         }
      },false)
   //
   // add continue event
   //
   addEventListener('continue_22D',function(e){
      //
      // get settings
      //
      var depth = parseFloat(document.getElementById("mod_depth").value)
      var thick = parseFloat(document.getElementById("mod_thickness").value)
      var path3 = []
      //
      // loop over segments
      //
      for (var seg = 0; seg < path2.length; ++seg) {
         var z = 0
         path3[path3.length] = []
         //
         // loop over z values
         //
         while (z < thick) {
            z += depth
            if (z > thick)
               z = thick
            var iz = Math.floor(0.5+document.mod.dpi*z/25.4)
            //
            // start new segment if ends don't meet
            //
            if ((path3[path3.length-1].length > 0)
               && ((path2[seg][0][X] != path2[seg][path2[seg].length-1][X])
               ||  (path2[seg][0][Y] != path2[seg][path2[seg].length-1][Y])))
               path3[path3.length] = []
            //
            // add points
            //
            for (var pt = 0; pt < path2[seg].length; ++pt) {
               path3[path3.length-1][path3[path3.length-1].length]
                  = [path2[seg][pt][X],path2[seg][pt][Y],-iz]
               }
            }
         }
      //
      // show path
      //
      mod_path_show_gl(path3)
      //
      // add path to DOM
      //
      document.mod.path = path3
      //
      // terminate worker
      //
      worker.terminate()
      },false)
   //
   // start worker
   //
   worker.postMessage(["mod_path_worker_image_2D_calculate",process_img,output_img,
      threshold,number,diameter,overlap,error,direction,sorting,sort_merge,sort_order,sort_sequence,document.mod.dpi])
   }
//
// mod_path_image_22D_controls
//    path from image 2.2D controls (intensity, depth, thickness)
//
function mod_path_image_22D_controls(routine) {
   var controls = document.getElementById("mod_process_controls")
   controls.innerHTML = "<br><b>process</b>"
   controls.innerHTML += "<br><input type='button' id='mod_path' value='calculate'\
      onclick='mod_path_image_22D()'>"
   mod_path_file_controls(routine)
   controls.innerHTML += "<br>direction:"
   controls.innerHTML += "<br>&nbsp;&nbsp;&nbsp;conventional <input type='radio' name='origin' id='mod_conventional'> climb <input type='radio' name='origin' id='mod_climb' checked>"
   controls.innerHTML += "<br>cut depth (mm):"
   controls.innerHTML += "<br>&nbsp;&nbsp;&nbsp;<input type='text' id='mod_depth' size='3' value='3.175'>"
   controls.innerHTML += "<br>stock thickness (mm):"
   controls.innerHTML += "<br>&nbsp;&nbsp;&nbsp;<input type='text' id='mod_thickness' size='3' value='11.11'>"
   controls.innerHTML += "<br>tool diameter (mm): "
   controls.innerHTML += "<br>&nbsp;&nbsp;&nbsp;<input type='text' id='mod_diameter' size=3 value='1'>" 
   controls.innerHTML += "<br>number of offsets (-1 to fill): "
   controls.innerHTML += "<br>&nbsp;&nbsp;&nbsp;<input type='text' id='mod_offsets' size=3 value='1'>" 
   controls.innerHTML += "<br>offset overlap (%): "
   controls.innerHTML += "<br>&nbsp;&nbsp;&nbsp;<input type='text' id='mod_overlap' size=3 value='50'>"
   controls.innerHTML += "<br>path error (pixels): "
   controls.innerHTML += "<br>&nbsp;&nbsp;&nbsp;<input type='text' id='mod_error' size=3 value='1.5'>" 
   controls.innerHTML += "<br>image threshold (0-1): "
   controls.innerHTML += "<br>&nbsp;&nbsp;&nbsp;<input type='text' id='mod_threshold' size=3 value='.5'>"
   controls.innerHTML += "<br>sort path: <input type='checkbox' id='mod_sort' checked>"
   controls.innerHTML += "<br>sort merge diameter multiple: "
   controls.innerHTML += "<br>&nbsp;&nbsp;&nbsp;<input type='text' id='mod_merge' size=3 value='1.5'>"
   controls.innerHTML += "<br>sort order weight:"
   controls.innerHTML += "<br>&nbsp;&nbsp;&nbsp;< 0: boundaries last"
   controls.innerHTML += "<br>&nbsp;&nbsp;&nbsp;= 0: min distance"
   controls.innerHTML += "<br>&nbsp;&nbsp;&nbsp;> 0: boundaries first"
   controls.innerHTML += "<br>&nbsp;&nbsp;&nbsp;<input type='text' id='mod_order' size=3 value='-1'>"
   controls.innerHTML += "<br>sort sequence weight:"
   controls.innerHTML += "<br>&nbsp;&nbsp;&nbsp;< 0: exterior last"
   controls.innerHTML += "<br>&nbsp;&nbsp;&nbsp;= 0: min distance"
   controls.innerHTML += "<br>&nbsp;&nbsp;&nbsp;> 0: exterior first"
   controls.innerHTML += "<br>&nbsp;&nbsp;&nbsp;<input type='text' id='mod_sequence' size=3 value='-1'>"
   }
//
// mod_path_image_25D
//    path from image 2.5D (rough cut)
//
function mod_path_image_25D() {
   //
   // clear display
   //
   mod_ui_clear()
   mod_ui_prompt('calculating path')
   //
   // get images
   //
   var input_canvas = document.getElementById("mod_input_canvas")
   var process_canvas = document.getElementById("mod_process_canvas")
   var output_canvas = document.getElementById("mod_output_canvas")
   var input_ctx = input_canvas.getContext("2d")
   var input_img = input_ctx.getImageData(0,0,input_canvas.width,input_canvas.height)
   var process_ctx = process_canvas.getContext("2d")
   process_ctx.drawImage(input_canvas,0,0)
   var process_img = process_ctx.getImageData(0,0,process_canvas.width,process_canvas.height)
   var output_ctx = output_canvas.getContext("2d")
   var output_img = output_ctx.getImageData(0,0,output_canvas.width,output_canvas.height)
   //
   // get arguments
   //
   var number = parseInt(document.getElementById("mod_offsets").value)
   var diameter = parseFloat(document.getElementById("mod_diameter").value)
   var overlap = parseFloat(document.getElementById("mod_overlap").value)
   var error = parseFloat(document.getElementById("mod_error").value)
   var direction = document.getElementById("mod_climb").checked
   var sorting = document.getElementById("mod_sort").checked
   var sort_merge = parseFloat(document.getElementById("mod_merge").value)
   var sort_order = parseFloat(document.getElementById("mod_order").value)
   var sort_sequence = parseFloat(document.getElementById("mod_sequence").value)
   var bottom_z = parseFloat(document.getElementById("mod_bottom_z").value)
   var bottom_i = parseFloat(document.getElementById("mod_bottom_i").value)
   var top_z = parseFloat(document.getElementById("mod_top_z").value)
   var top_i = parseFloat(document.getElementById("mod_top_i").value)
   var depth = parseFloat(document.getElementById("mod_depth").value)
   //
   // set up path Web worker
   //
   var worker = new Worker('processes/mod_path_worker.js')
   var path3 = []
   var z = top_z
   worker.addEventListener('message',function(e){
      if (e.data[0] == 'prompt')
         //
         // prompt message from worker
         //
         mod_ui_prompt('layer '+z+'/'+bottom_z+' : '+e.data[1])
      else if (e.data[0] == 'console')
         //
         // console message from worker
         //
         console.log(e.data[1])
      else if (e.data[0] == 'path') {
         //
         // partial path message from worker
         //
         path = e.data[1]
         //
         // show path
         //
         mod_path_show_gl(path)
         }
      else if (e.data[0] == 'return') {
         //
         // path message from worker
         //
         var path2 = e.data[1]
         //
         // accumulate layer
         //
         var i = bottom_i + (top_i - bottom_i)*(z - bottom_z)/(top_z - bottom_z)
         var iz = Math.floor(0.5+document.mod.dpi*z/25.4)
         for (var seg = 0; seg < path2.length; ++seg) {
            path3[path3.length] = []
            for (var pt = 0; pt < path2[seg].length; ++pt) {
               path3[path3.length-1][path3[path3.length-1].length]
                  = [path2[seg][pt][X],path2[seg][pt][Y],iz]
               }
            }
         //
         // show path
         //
         mod_path_show_gl(path3)
         //
         // loop
         //
         if (z <= bottom_z) {
            //
            // call continue event
            //
            var event = new Event('continue_25D') 
            dispatchEvent(event)
            }
         else {
            z -= depth
            if (z < bottom_z)
               z = bottom_z
            var i = bottom_i + (top_i - bottom_i)*(z - bottom_z)/(top_z - bottom_z)
            var iz = Math.floor(0.5+document.mod.dpi*z/25.4)
            worker.postMessage(["mod_path_worker_image_2D_calculate",process_img,output_img,
               i,number,diameter,overlap,error,direction,sorting,sort_merge,sort_order,sort_sequence,document.mod.dpi])
            }
         }
      },false)
   //
   // add continue event
   //
   addEventListener('continue_25D',function(e){
      //
      // add path to DOM
      //
      document.mod.path = path3
      //
      // terminate worker
      //
      worker.terminate()
      },false)
   //
   // start worker
   //
   z -= depth
   if (z < bottom_z)
      z = bottom_z
   var i = bottom_i + (top_i - bottom_i)*(z - bottom_z)/(top_z - bottom_z)
   var iz = Math.floor(0.5+document.mod.dpi*z/25.4)
   worker.postMessage(["mod_path_worker_image_2D_calculate",process_img,output_img,
      i,number,diameter,overlap,error,direction,sorting,sort_merge,sort_order,sort_sequence,document.mod.dpi])
   }
//
// mod_path_image_25D_controls
//    path from image 2.5D controls (rough cut)
//
function mod_path_image_25D_controls(routine) {
   var controls = document.getElementById("mod_process_controls")
   controls.innerHTML = "<br><b>process</b>"
   controls.innerHTML += "<br><input type='button' id='mod_path' value='calculate'\
      onclick='mod_path_image_25D()'>"
   mod_path_file_controls(routine)
   controls.innerHTML += "<br>bottom z (mm):"
   if (document.mod.zmin == "")
      controls.innerHTML += "<br>&nbsp;&nbsp;&nbsp;<input type='text' id='mod_bottom_z' size='3' value='-10'>"
   else
      controls.innerHTML += "<br>&nbsp;&nbsp;&nbsp;<input type='text' id='mod_bottom_z' size='3' value='"+document.mod.zmin.toFixed(3)+"'>"
   controls.innerHTML += "<br>bottom intensity (0-1):"
   controls.innerHTML += "<br>&nbsp;&nbsp;&nbsp;<input type='text' id='mod_bottom_i' size='3' value='0'>"
   controls.innerHTML += "<br>top z (mm):"
   controls.innerHTML += "<br>&nbsp;&nbsp;&nbsp;<input type='text' id='mod_top_z' size='3' value='0'>"
   controls.innerHTML += "<br>top intensity (0-1):"
   controls.innerHTML += "<br>&nbsp;&nbsp;&nbsp;<input type='text' id='mod_top_i' size='3' value='1'>"
   controls.innerHTML += "<br>direction:"
   controls.innerHTML += "<br>&nbsp;&nbsp;&nbsp;conventional <input type='radio' name='origin' id='mod_conventional'> climb <input type='radio' name='origin' id='mod_climb' checked>"
   controls.innerHTML += "<br>cut depth (mm):"
   controls.innerHTML += "<br>&nbsp;&nbsp;&nbsp;<input type='text' id='mod_depth' size='3' value='1'>"
   controls.innerHTML += "<br>tool diameter (mm):"
   controls.innerHTML += "<br>&nbsp;&nbsp;&nbsp;<input type='text' id='mod_diameter' size=3 value='3.175'>" 
   controls.innerHTML += "<br>number of offsets (-1 to fill):"
   controls.innerHTML += "<br>&nbsp;&nbsp;&nbsp;<input type='text' id='mod_offsets' size=3 value='-1'>"
   controls.innerHTML += "<br>offset overlap (%):"
   controls.innerHTML += "<br>&nbsp;&nbsp;&nbsp;<input type='text' id='mod_overlap' size=3 value='50'>"
   controls.innerHTML += "<br>path error (pixels):"
   controls.innerHTML += "<br>&nbsp;&nbsp;&nbsp;<input type='text' id='mod_error' size=3 value='1.5'>" 
   controls.innerHTML += "<br>sort path: <input type='checkbox' id='mod_sort' checked>"
   controls.innerHTML += "<br>sort merge diameter multiple:"
   controls.innerHTML += "<br>&nbsp;&nbsp;&nbsp;<input type='text' id='mod_merge' size=3 value='1.1'>"
   controls.innerHTML += "<br>sort order weight:"
   controls.innerHTML += "<br>&nbsp;&nbsp;&nbsp;< 0: boundaries last"
   controls.innerHTML += "<br>&nbsp;&nbsp;&nbsp;= 0: min distance"
   controls.innerHTML += "<br>&nbsp;&nbsp;&nbsp;> 0: boundaries first"
   controls.innerHTML += "<br>&nbsp;&nbsp;&nbsp;<input type='text' id='mod_order' size=3 value='-1'>"
   controls.innerHTML += "<br>sort sequence weight:"
   controls.innerHTML += "<br>&nbsp;&nbsp;&nbsp;< 0: exterior last"
   controls.innerHTML += "<br>&nbsp;&nbsp;&nbsp;= 0: min distance"
   controls.innerHTML += "<br>&nbsp;&nbsp;&nbsp;> 0: exterior first"
   controls.innerHTML += "<br>&nbsp;&nbsp;&nbsp;<input type='text' id='mod_sequence' size=3 value='-1'>"
   }
//
// mod_path_image_3D
//    path from image 3D (finish cut)
//
function mod_path_image_3D() {
   //
   // clear display
   //
   mod_ui_clear()
   mod_ui_prompt('calculating path')
   //
   // get images
   //
   var input_canvas = document.getElementById("mod_input_canvas")
   var process_canvas = document.getElementById("mod_process_canvas")
   var output_canvas = document.getElementById("mod_output_canvas")
   var input_ctx = input_canvas.getContext("2d")
   var input_img = input_ctx.getImageData(0,0,input_canvas.width,input_canvas.height)
   var process_ctx = process_canvas.getContext("2d")
   process_ctx.drawImage(input_canvas,0,0)
   var process_img = process_ctx.getImageData(0,0,process_canvas.width,process_canvas.height)
   //
   // get settings
   //
   var bottom_z = parseFloat(document.getElementById("mod_bottom_z").value)   
   var bottom_i = parseFloat(document.getElementById("mod_bottom_i").value)   
   var top_z = parseFloat(document.getElementById("mod_top_z").value)   
   var top_i = parseFloat(document.getElementById("mod_top_i").value)   
   var diameter = parseFloat(document.getElementById("mod_diameter").value)   
   var overlap = parseFloat(document.getElementById("mod_overlap").value)   
   var type = document.getElementById("mod_flat").checked
   var xz = document.getElementById("mod_xz").checked
   var yz = document.getElementById("mod_yz").checked
   var error = parseFloat(document.getElementById("mod_error").value)
   //
   // set up path Web worker
   //
   var worker = new Worker('processes/mod_path_worker.js')
   var path = []
   worker.addEventListener('message',function(e){
      if (e.data[0] == 'prompt')
         //
         // prompt message from worker
         //
         mod_ui_prompt(e.data[1])
      else if (e.data[0] == 'console')
         //
         // console message from worker
         //
         console.log(e.data[1])
      /*
      else if (e.data[0] == 'collision') {
         //
         // collision message from worker
         //
         collision = e.data[1]
         }
      */
      else if (e.data[0] == 'path') {
         //
         // partial path message from worker
         //
         path = e.data[1]
         mod_path_show_gl(path)
         }
      else if (e.data[0] == 'return') {
         //
         // complete path message from worker
         //
         path = e.data[1]
         //
         // call continue event
         //
         var event = new Event('continue_3D') 
         dispatchEvent(event)
         }
      },false)
   //
   // add continue event
   //
   addEventListener('continue_3D',function(e){
      /*
      //
      // check for collision
      //
      if (collision)
         mod_ui_prompt("error: tool collision")
      */
      //
      // add path to DOM
      //
      document.mod.path = path
      },false)
   //
   // start worker
   //
   worker.postMessage(["mod_path_worker_image_offset_z",
      process_img,diameter,overlap,type,xz,yz,error,document.mod.dpi,bottom_z,bottom_i,top_z,top_i])
   }
//
// mod_path_image_3D_controls
//    path from image 3D controls (rough cut)
//
function mod_path_image_3D_controls(routine) {
   var controls = document.getElementById("mod_process_controls")
   controls.innerHTML = "<br><b>process</b>"
   controls.innerHTML += "<br><input type='button' id='mod_path' value='calculate'\
      onclick='mod_path_image_3D()'>"
   mod_path_file_controls(routine)
   controls.innerHTML += "<br>bottom z (mm):"
   if (document.mod.zmin == "")
      controls.innerHTML += "<br>&nbsp;&nbsp;&nbsp;<input type='text' id='mod_bottom_z' size='3' value='-10'>"
   else
      controls.innerHTML += "<br>&nbsp;&nbsp;&nbsp;<input type='text' id='mod_bottom_z' size='3' value='"+document.mod.zmin.toFixed(3)+"'>"
   controls.innerHTML += "<br>bottom intensity (0-1):"
   controls.innerHTML += "<br>&nbsp;&nbsp;&nbsp;<input type='text' id='mod_bottom_i' size='3' value='0'>"
   controls.innerHTML += "<br>top z (mm):"
   controls.innerHTML += "<br>&nbsp;&nbsp;&nbsp;<input type='text' id='mod_top_z' size='3' value='0'>"
   controls.innerHTML += "<br>top intensity (0-1):"
   controls.innerHTML += "<br>&nbsp;&nbsp;&nbsp;<input type='text' id='mod_top_i' size='3' value='1'>"
   controls.innerHTML += "<br>tool diameter (mm):"
   controls.innerHTML += "<br>&nbsp;&nbsp;&nbsp;<input type='text' id='mod_diameter' size=3 value='3.175'>" 
   //controls.innerHTML += "<br>clearance length (mm):"
   //controls.innerHTML += "<br>&nbsp;&nbsp;&nbsp;<input type='text' id='mod_clear_len' size=3 value='25.4'>" 
   //controls.innerHTML += "<br>clearance diameter (mm):"
   //controls.innerHTML += "<br>&nbsp;&nbsp;&nbsp;<input type='text' id='mod_clear_dia' size=3 value='6.35'>" 
   controls.innerHTML += "<br>tool overlap (%):"
   controls.innerHTML += "<br>&nbsp;&nbsp;&nbsp;<input type='text' id='mod_overlap' size=3 value='0'>"
   controls.innerHTML += "<br>direction: <input type='checkbox' id='mod_xz' checked> xz <input type='checkbox' id='mod_yz' checked> yz"
   controls.innerHTML += "<br>type: <input type='radio' name='mod_type' id='mod_flat' checked> flat end <input type='radio' name='mod_type' id='mod_ball'> ball end"
   controls.innerHTML += "<br>path error (pixels):"
   controls.innerHTML += "<br>&nbsp;&nbsp;&nbsp;<input type='text' id='mod_error' size=3 value='1.5'>" 
   }
//
// mod_path_image_halftone_calculate
//    path from image halftone calculate
//
function mod_path_image_halftone_calculate() {
   mod_ui_prompt("calculating path ...")
   //
   // clear display
   //
   mod_ui_clear()
   //
   // get image
   //
   var input_canvas = document.getElementById("mod_input_canvas")
   var input_ctx = input_canvas.getContext("2d")
   var input_img = input_ctx.getImageData(0,0,input_canvas.width,input_canvas.height)
   //
   // halftone
   //
   var diameter = parseFloat(document.getElementById("mod_diameter").value)
   var spot_size = parseFloat(document.getElementById("mod_spot_size").value)
   var spot_min = parseFloat(document.getElementById("mod_spot_min").value)
   var spot_spacing_h = parseFloat(document.getElementById("mod_spot_spacing_h").value)
   var spot_spacing_v = parseFloat(document.getElementById("mod_spot_spacing_v").value)
   var spot_points = parseFloat(document.getElementById("mod_spot_points").value)
   var spot_fill = document.getElementById("mod_spot_fill").checked
   var path = mod_image_halftone(input_img,
      diameter,spot_size,spot_min,spot_spacing_h,spot_spacing_v,spot_points,spot_fill)
   //
   // sort path
   //
   if (document.getElementById("mod_spot_sort").checked)
      path = mod_path_sort(path)
   //
   // show path
   //
   //mod_path_show_2D_svg(path)
   //mod_path_show_2D_canvas(path)
   mod_path_show_gl(path)
   //
   // add path to DOM
   //
   document.mod.path = path
   mod_ui_prompt("")
   }
//
// mod_path_image_halftone_controls
//    path from image halftone controls
//
function mod_path_image_halftone_controls(type,routine) {
   var controls = document.getElementById("mod_process_controls")
   controls.innerHTML = "<br><b>process</b>"
   controls.innerHTML += "<br><input type='button' id='mod_path' value='calculate'\
      onclick='mod_path_image_halftone_calculate()'>"
   mod_path_file_controls(type,routine)
   controls.innerHTML += "<br>tool diameter (mm): "
   controls.innerHTML += "<input type='text' id='mod_diameter' size=3 value='0'>" 
   controls.innerHTML += "<br>spot size (mm): "
   controls.innerHTML += "<br><input type='text' id='mod_spot_size' size=3 value='2'>" 
   controls.innerHTML += "<br>minimum spot size (%): "
   controls.innerHTML += "<br><input type='text' id='mod_spot_min' size=3 value='25'>" 
   controls.innerHTML += "<br>horizontal spot spacing (%): "
   controls.innerHTML += "<br><input type='text' id='mod_spot_spacing_h' size=3 value='25'>" 
   controls.innerHTML += "<br>vertical spot spacing (%): "
   controls.innerHTML += "<br><input type='text' id='mod_spot_spacing_v' size=3 value='25'>" 
   controls.innerHTML += "<br>points per spot: "
   controls.innerHTML += "<br><input type='text' id='mod_spot_points' size=3 value='4'>"
   controls.innerHTML += "<br>fill spot: <input type='checkbox' id='mod_spot_fill'>"
   controls.innerHTML += "<br>sort path: <input type='checkbox' id='mod_spot_sort'>"
   }

