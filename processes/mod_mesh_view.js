//
// mod_mesh_view.js
//   fab modules mesh viewing routines
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
// mod_mesh_draw
//    draw mesh
//
function mod_mesh_draw(mesh) {
   if (mesh.length == 0)
      return
   //
   // clear display
   //
   mod_ui_clear()   
   //
   // set up canvas
   //
   var canvas = document.getElementById("mod_input_canvas")
   canvas.style.display = "inline"
   var owidth = canvas.offsetWidth
   var oheight = canvas.offsetHeight
   canvas.style.display = "none"
   var canvas = document.getElementById("mod_gl_canvas")
   canvas.style.display = "inline"
   canvas.focus()
   canvas.width = owidth
   canvas.height = owidth
   //
   // set up canvas event handlers
   //
   if (document.mod.dx == "") document.mod.dx = 0
   if (document.mod.dy == "") document.mod.dy = 0
   if (document.mod.dz == "") document.mod.dz = 0
   if (document.mod.rx == "") document.mod.rx = 0
   if (document.mod.ry == "") document.mod.ry = 0
   if (document.mod.rz == "") document.mod.rz = 0
   if (document.mod.s == "") document.mod.s = 1
   document.mod.down = false
   canvas.oncontextmenu = function(evt) {
      evt.preventDefault()
      evt.stopPropagation()
      }
   canvas.onmousedown = function(evt) {
      document.mod.down = true
      document.mod.button = evt.button
      document.mod.xdown = evt.clientX
      document.mod.ydown = evt.clientY
      }
   canvas.onmouseup = function(evt) {
      document.mod.down = false
      if (document.mod.button == 0) {
         document.mod.mesh.dx = document.mod.mesh.dx + 2*(evt.clientX - document.mod.xdown)/
            (canvas.offsetWidth*document.mod.mesh.s)
         document.mod.mesh.dy = document.mod.mesh.dy-2*(evt.clientY - document.mod.ydown)/
            (canvas.offsetWidth*document.mod.mesh.s)
         draw(document.mod.mesh.s,document.mod.mesh.dx,document.mod.mesh.dy,
            document.mod.mesh.rx,document.mod.mesh.rz)
         }
      else if (document.mod.button == 2) {
         document.mod.mesh.rz = document.mod.mesh.rz + Math.PI*(evt.clientX - document.mod.xdown)/
            canvas.offsetWidth
         document.mod.mesh.rx = document.mod.mesh.rx - Math.PI*(evt.clientY - document.mod.ydown)/
            canvas.offsetHeight
         }
      }
   canvas.onmousemove = function(evt) {
      if (document.mod.down == false)
         return
      if (document.mod.button == 0) {
         var dx = document.mod.mesh.dx + 2*(evt.clientX - document.mod.xdown)/
            (canvas.offsetWidth*document.mod.mesh.s)
         var dy = document.mod.mesh.dy-2*(evt.clientY - document.mod.ydown)/
            (canvas.offsetWidth*document.mod.mesh.s)
         draw(document.mod.mesh.s,dx,dy,document.mod.mesh.rx,document.mod.mesh.rz)
         document.getElementById("mod_dx").value = dx.toFixed(3)
         document.getElementById("mod_dy").value = dy.toFixed(3)
         }
      else if (document.mod.button == 2) {
         var rz = document.mod.mesh.rz + Math.PI*(evt.clientX - document.mod.xdown)/
            canvas.offsetWidth
         var rx = document.mod.mesh.rx - Math.PI*(evt.clientY - document.mod.ydown)/
            canvas.offsetWidth
         draw(document.mod.mesh.s,document.mod.mesh.dx,document.mod.mesh.dy,rx,rz)
         document.getElementById("mod_rx").value = (180*rx/Math.PI).toFixed(3)
         document.getElementById("mod_rz").value = (180*rz/Math.PI).toFixed(3)
         }
      }
   canvas.onwheel = function(evt) {
      evt.preventDefault()
      evt.stopPropagation()
      if (evt.deltaY < 0) {
         document.mod.mesh.s *= 1.1
         }
      else {
         document.mod.mesh.s *= 0.9
         }
      document.mod.width = Math.floor(0.5+document.mod.dpi*
         (document.mod.mesh.xmax-document.mod.mesh.xmin)/(document.mod.mesh.s*document.mod.mesh.units))
      document.getElementById("mod_px").innerHTML = 
         "width: "+document.mod.width+" px"
      draw(document.mod.mesh.s,document.mod.mesh.dx,document.mod.mesh.dy,
         document.mod.mesh.rx,document.mod.mesh.rz)
      document.getElementById("mod_s").value = document.mod.mesh.s.toFixed(3)
      }
   //
   // set up GL
   //
   var gl = canvas.getContext("webgl")
   if (!gl) {
      var gl = canvas.getContext("experimental-webgl")
      if (!gl) {
         alert("error: WebGL not supported")
         return
         }
       }
   gl.viewport(0,0,owidth,owidth)
   //
   // load the vertex shader
   //
   var vertCode = "\
   attribute vec3 vertexPosition;\
   uniform mat4 perspectiveMatrix;\
   void main(void) {\
      gl_Position = perspectiveMatrix * vec4(vertexPosition, 1.0);\
      }"
   var vertexShader = gl.createShader(gl.VERTEX_SHADER)
   gl.shaderSource(vertexShader, vertCode)
   gl.compileShader(vertexShader)
   if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
      alert("error: can't compile the vertex shader")
      gl.deleteShader(vertexShader)
      return
      }
   //
   // load the fragment shader
   //
   var fragCode = "\
      precision mediump float;\
      uniform vec3 color;\
      void main(void) {\
        gl_FragColor = vec4( color.r, color.g, color.b, 1.0);\
        }"
   var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
   gl.shaderSource(fragmentShader, fragCode)
   gl.compileShader(fragmentShader)
   if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
      alert("error: can't compile the fragment shader")
      gl.deleteShader(fragmentShader)
      return
      }
   //
   // create the shader program
   //
   gl.program = gl.createProgram()
   gl.attachShader(gl.program, vertexShader)
   gl.attachShader(gl.program, fragmentShader)
   gl.linkProgram(gl.program)
   if (!gl.getProgramParameter(gl.program, gl.LINK_STATUS)) {
      alert("error: can't initialise shaders")
      gl.deleteProgram(gl.program)
      gl.deleteProgram(vertexShader)
      gl.deleteProgram(fragmentShader)
      return
      }
   gl.useProgram(gl.program)
   //
   // add triangles
   //
   var triangles = new Float32Array(3*2*3*mesh.length)
   for (var t = 0; t < mesh.length; ++t) {
      triangles[18*t+0] = mesh[t][0][0]
      triangles[18*t+1] = mesh[t][0][1]
      triangles[18*t+2] = mesh[t][0][2]
      triangles[18*t+3] = mesh[t][1][0]
      triangles[18*t+4] = mesh[t][1][1]
      triangles[18*t+5] = mesh[t][1][2]
      triangles[18*t+6] = mesh[t][1][0]
      triangles[18*t+7] = mesh[t][1][1]
      triangles[18*t+8] = mesh[t][1][2]
      triangles[18*t+9] = mesh[t][2][0]
      triangles[18*t+10] = mesh[t][2][1]
      triangles[18*t+11] = mesh[t][2][2]
      triangles[18*t+12] = mesh[t][2][0]
      triangles[18*t+13] = mesh[t][2][1]
      triangles[18*t+14] = mesh[t][2][2]
      triangles[18*t+15] = mesh[t][0][0]
      triangles[18*t+16] = mesh[t][0][1]
      triangles[18*t+17] = mesh[t][0][2]
      }
   //
   // scale
   //
   var v = 0
   while (v < triangles.length) {
      triangles[v] = 2*(triangles[v]-mesh.xmin)/(mesh.xmax-mesh.xmin)-1
      v += 1
      triangles[v] = 2*(triangles[v]-(mesh.ymax+mesh.ymin)/2)/(mesh.xmax-mesh.xmin)
      v += 1
      triangles[v] = 2*(triangles[v]-(mesh.zmax+mesh.zmin)/2)/(mesh.xmax-mesh.xmin)
      v += 1
      }
   //
   // buffer
   //
   var triangle_buffer = gl.createBuffer()
   gl.bindBuffer(gl.ARRAY_BUFFER,triangle_buffer)
   gl.bufferData(gl.ARRAY_BUFFER,triangles,gl.STATIC_DRAW)
   //
   // enable depth testing
   //
   //gl.enable(gl.DEPTH_TEST)
   //
   // enable culling
   //
   //gl.enable(gl.CULL_FACE)
   //gl.cullFace(gl.BACK)
   //
   // enable vertex array
   //
   var vertexPosition = gl.getAttribLocation(gl.program,"vertexPosition")
   gl.enableVertexAttribArray(vertexPosition)
   //
   // get locations
   //
   var ucolor = gl.getUniformLocation(gl.program,"color")
   var uPerspectiveMatrix = gl.getUniformLocation(gl.program, "perspectiveMatrix")
   //
   // draw path
   //
   draw(document.mod.mesh.s,document.mod.mesh.dx,document.mod.mesh.dy,
      document.mod.mesh.rx,document.mod.mesh.rz)
   mod_ui_prompt("left: pan, scroll: zoom, right: rotate, c: connections")
   //
   // matrix routines
   //
   function mult4(a,b) {
      var c = []
      for (var i = 0; i < 4; ++i)
         for (var j = 0; j < 4; ++j)
            c.push(a[j]*b[4*i]+a[j+4]*b[4*i+1]+a[j+8]*b[4*i+2]+a[j+12]*b[4*i+3])
      return c
      }
   function ortho4(left,right,bottom,top,near,far) {
      return [
         2/(right-left), 0, 0, -(right+left)/(right-left),
         0, 2/(top-bottom), 0, -(top+bottom)/(top-bottom),
         0, 0, -2/(far-near), -(far+near)/(far-near),
         0, 0, 0, 1,
         ]
      }
   function translate4(tx,ty,tz) {
      return [
         1,  0,  0,  0,
         0,  1,  0,  0,
         0,  0,  1,  0,
         tx, ty, tz, 1,
         ]
      }
   function rotate4_x(angle) {
      var c = Math.cos(angle)
      var s = Math.sin(angle)
      return [
         1, 0, 0, 0,
         0, c, s, 0,
         0, -s, c, 0,
         0, 0, 0, 1,
         ]
      }
   function rotate4_y(angle) {
      var c = Math.cos(angle)
      var s = Math.sin(angle)
      return [
         c, 0, -s, 0,
         0, 1, 0, 0,
         s, 0, c, 0,
         0, 0, 0, 1,
         ]
      }
   function rotate4_z(angle) {
      var c = Math.cos(angle)
      var s = Math.sin(angle)
      return [
         c, s, 0, 0,
        -s, c, 0, 0,
         0, 0, 1, 0,
         0, 0, 0, 1,
         ]
      }
   function scale4_xy(sx,sy) {
      return [
         sx, 0,  0,  0,
         0, sy,  0,  0,
         0,  0,  0,  0,
         0,  0,  0,  1,
         ]
      }
   //
   // draw routine
   //
   function draw(s,dx,dy,rx,rz) {
      //
      // create orthographic perspective matrix
      //
      var perspectiveMatrix =
         mult4(scale4_xy(s,s),
         mult4(translate4(dx,dy,0),
         mult4(rotate4_x(rx),
         mult4(rotate4_z(rz),
               ortho4(-1,1,-1,1,-1,1)))))
      //
      // set the view matrix
      //
      gl.uniformMatrix4fv(uPerspectiveMatrix, false, new Float32Array(perspectiveMatrix))
      //
      // clear
      //
      gl.clearColor(1.0,1.0,1.0,1.0)
      gl.clearDepth(1.0)
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
      //
      // draw triangles
      //
      gl.uniform3f(ucolor,0,0,0.25)
      gl.bindBuffer(gl.ARRAY_BUFFER,triangle_buffer)
      gl.vertexAttribPointer(vertexPosition, 3.0, gl.FLOAT, false, 0, 0)
      gl.drawArrays(gl.LINES,0,triangles.length/3.0)
      //
      // flush
      //      
      gl.flush()
      }
   document.mod.mesh.draw = draw
   }

