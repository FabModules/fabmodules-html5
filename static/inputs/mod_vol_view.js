//
// mod_vol_view.js
//   fab modules volume viewing routines
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

define(['require', 'mods/mod_ui', 'mods/mod_globals'], function(require) {

   var ui = require('mods/mod_ui');
   var globals = require('mods/mod_globals');

   var findEl = globals.findEl;

   //
   // mod_vol_hist_draw
   //    draw histogram
   //

   function mod_vol_hist_draw(hist, vmin, vmax) {
      var gamma = 1 / 3
      var len = hist.length
      if (len == 0)
         return
         //
         // clear display
         //
      ui.ui_clear()
      //
      // set up canvas
      //
      var canvas = findEl("mod_input_canvas")
      canvas.style.display = "inline"
      var owidth = canvas.offsetWidth
      var oheight = canvas.offsetHeight
      canvas.style.display = "none"
      var canvas = findEl("mod_gl_canvas")
      canvas.style.display = "inline"
      canvas.focus()
      canvas.width = owidth
      canvas.height = owidth
      //
      // set up canvas event handlers
      //
      if (globals.dx == "") globals.dx = 0
      if (globals.dy == "") globals.dy = 0
      if (globals.dz == "") globals.dz = 0
      if (globals.rx == "") globals.rx = 0
      if (globals.ry == "") globals.ry = 0
      if (globals.rz == "") globals.rz = 0
      if (globals.s == "") globals.s = 1
      canvas.oncontextmenu = function(evt) {
         evt.preventDefault()
         evt.stopPropagation()
      }
      canvas.onmousedown = function(evt) {
         var x = vmin + (vmax - vmin) * (evt.clientX - evt.target.offsetParent.offsetLeft) / owidth
         if (evt.button == 0)
            findEl("mod_min_threshold").value = x
         else if (evt.button == 2)
            findEl("mod_max_threshold").value = x
      }
      canvas.onmousemove = function(evt) {
         var x = vmin + (vmax - vmin) * (evt.clientX - evt.target.offsetParent.offsetLeft) / owidth
         var i = Math.floor(len * (evt.clientX - evt.target.offsetParent.offsetLeft) / owidth)
         var y = hist[i] / globals.vol.hmax
         ui.ui_prompt('value: ' + x.toFixed(3) + ', amplitude: ' + y.toFixed(3) + '; left: min, right: max')
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
      gl.viewport(0, 0, owidth, owidth)
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
      // add histogram
      //
      var lines = new Float32Array(2 * 3 * hist.length)
      for (var b = 0; b < (len - 1); ++b) {
         lines[6 * b + 0] = 2 * b / (len - 1) - 1
         lines[6 * b + 1] = hist[b]
         lines[6 * b + 2] = 0
         lines[6 * b + 3] = 2 * (b + 1) / (len - 1) - 1
         lines[6 * b + 4] = hist[b + 1]
         lines[6 * b + 5] = 0
         if (hist[b] > globals.vol.hmax)
            globals.vol.hmax = hist[b]
      }
      //
      // scale and gamma
      //
      for (var b = 0; b < (len - 1); ++b) {
         lines[6 * b + 1] = Math.pow(lines[6 * b + 1] / globals.vol.hmax, 0.1)
         lines[6 * b + 4] = Math.pow(lines[6 * b + 4] / globals.vol.hmax, 0.1)
      }
      //
      // buffer
      //
      var lines_buffer = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, lines_buffer)
      gl.bufferData(gl.ARRAY_BUFFER, lines, gl.STATIC_DRAW)
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
      var vertexPosition = gl.getAttribLocation(gl.program, "vertexPosition")
      gl.enableVertexAttribArray(vertexPosition)
      //
      // get locations
      //
      var ucolor = gl.getUniformLocation(gl.program, "color")
      var uPerspectiveMatrix = gl.getUniformLocation(gl.program, "perspectiveMatrix")
      //
      // draw path
      //
      draw(globals.s, globals.dx, globals.dy, globals.rx, globals.rz)
      ui.ui_prompt("left: pan, scroll: zoom, right: rotate, c: connections")
      //
      // matrix routines
      //

         function mult4(a, b) {
            var c = []
            for (var i = 0; i < 4; ++i)
               for (var j = 0; j < 4; ++j)
                  c.push(a[j] * b[4 * i] + a[j + 4] * b[4 * i + 1] + a[j + 8] * b[4 * i + 2] + a[j + 12] * b[4 * i + 3])
            return c
         }

         function ortho4(left, right, bottom, top, near, far) {
            return [
               2 / (right - left), 0, 0, -(right + left) / (right - left),
               0, 2 / (top - bottom), 0, -(top + bottom) / (top - bottom),
               0, 0, -2 / (far - near), -(far + near) / (far - near),
               0, 0, 0, 1,
            ]
         }

         function translate4(tx, ty, tz) {
            return [
               1, 0, 0, 0,
               0, 1, 0, 0,
               0, 0, 1, 0,
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
               c, s, 0, 0, -s, c, 0, 0,
               0, 0, 1, 0,
               0, 0, 0, 1,
            ]
         }

         function scale4_xy(sx, sy) {
            return [
               sx, 0, 0, 0,
               0, sy, 0, 0,
               0, 0, 0, 0,
               0, 0, 0, 1,
            ]
         }
         //
         // draw routine
         //

         function draw(s, dx, dy, rx, rz) {
            //
            // create orthographic perspective matrix
            //
            var perspectiveMatrix =
               mult4(scale4_xy(s, s),
                  mult4(translate4(dx, dy, 0),
                     mult4(rotate4_x(rx),
                        mult4(rotate4_z(rz),
                           ortho4(-1, 1, -1, 1, -1, 1)))))
            //
            // set the view matrix
            //
            gl.uniformMatrix4fv(uPerspectiveMatrix, false, new Float32Array(perspectiveMatrix))
            //
            // clear
            //
            gl.clearColor(1.0, 1.0, 1.0, 1.0)
            gl.clearDepth(1.0)
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
            //
            // draw histogram
            //
            gl.uniform3f(ucolor, 0, 0, 0.25)
            gl.bindBuffer(gl.ARRAY_BUFFER, lines_buffer)
            gl.vertexAttribPointer(vertexPosition, 3.0, gl.FLOAT, false, 0, 0)
            gl.drawArrays(gl.LINES, 0, lines.length / 3.0)
            //
            // flush
            //      
            gl.flush()
         }
      globals.mesh.draw = draw
   }

   return {
      hist_draw: mod_vol_hist_draw
   }

});
