//
// mod_path_view.js
//   fab modules path viewing routines
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


define(["require", "mods/mod_ui", "mods/mod_globals"], function(require) {

   var ui = require("mods/mod_ui");
   var globals = require("mods/mod_globals");

   var findEl = globals.findEl;


   //
   // defines
   //
   var X = 0
   var Y = 1
   var Z = 2

   //
   // mod_path_show_gl
   //    show a path with WebGL
   //

      function mod_path_show_gl(path) {
         if (path.length == 0)
            return
         var show_connections = true
         //
         // clear display
         //
         ui.ui_clear()
         //
         // set up canvas
         //
         var canvas = findEl("mod_input_canvas")
         var width = canvas.width
         var height = canvas.height
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
         globals.down = false
         canvas.oncontextmenu = function(evt) {
            evt.preventDefault()
            evt.stopPropagation()
         }
         canvas.onmousedown = function(evt) {
            globals.down = true
            globals.button = evt.button
            globals.xdown = evt.clientX
            globals.ydown = evt.clientY
         }
         canvas.onmouseup = function(evt) {
            globals.down = false
            if (globals.button == 0) {
               globals.dx = globals.dx + 2 * (evt.clientX - globals.xdown) /
                  (canvas.offsetWidth * globals.s)
               globals.dy = globals.dy - 2 * (evt.clientY - globals.ydown) /
                  (canvas.offsetWidth * globals.s)
               draw(globals.s, globals.dx, globals.dy, globals.rx, globals.rz)
            } else if (globals.button == 2) {
               globals.rz = globals.rz + Math.PI * (evt.clientX - globals.xdown) /
                  canvas.offsetWidth
               globals.rx = globals.rx - Math.PI * (evt.clientY - globals.ydown) /
                  canvas.offsetHeight
            }
         }
         canvas.onmousemove = function(evt) {
            if (globals.down == false)
               return
            if (globals.button == 0) {
               var dx = globals.dx + 2 * (evt.clientX - globals.xdown) /
                  (canvas.offsetWidth * globals.s)
               var dy = globals.dy - 2 * (evt.clientY - globals.ydown) /
                  (canvas.offsetWidth * globals.s)
               draw(globals.s, dx, dy, globals.rx, globals.rz)
            } else if (globals.button == 2) {
               var rz = globals.rz + Math.PI * (evt.clientX - globals.xdown) /
                  canvas.offsetWidth
               var rx = globals.rx - Math.PI * (evt.clientY - globals.ydown) /
                  canvas.offsetWidth
               draw(globals.s, globals.dx, globals.dy, rx, rz)
            }
         }
         canvas.onwheel = function(evt) {
            evt.preventDefault()
            evt.stopPropagation()
            if (evt.deltaY < 0) {
               globals.s *= 1.1
            } else {
               globals.s *= 0.9
            }
            draw(globals.s, globals.dx, globals.dy, globals.rx, globals.rz)
         }
         canvas.onkeydown = function(evt) {
            if (evt.keyCode == 67) // c
               show_connections = !show_connections
            draw(globals.s, globals.dx, globals.dy, globals.rx, globals.rz)
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
         // function to add 3D arrow vertices
         //

         function arrow3(x1, y1, z1, x2, y2, z2, w, a, arr, npts) {
            var dx = x2 - x1
            var dy = y2 - y1
            var dz = z2 - z1
            var d = Math.sqrt(dx * dx + dy * dy + dz * dz)
            if (d > 0) {
               dx = dx / d
               dy = dy / d
               dz = dz / d
               if ((dx == 0) && (dy == 0)) {
                  nx = 1 / Math.sqrt(2)
                  ny = 1 / Math.sqrt(2)
               } else {
                  var nx = dy / Math.sqrt(dx * dx + dy * dy)
                  var ny = -dx / Math.sqrt(dx * dx + dy * dy)
               }
               var x3 = x1 + w * nx
               var y3 = y1 + w * ny
               var z3 = z1
               var x4 = x2 + w * nx - a * dx
               var y4 = y2 + w * ny - a * dy
               var z4 = z2 - a * dz
               var x5 = x1 - w * nx
               var y5 = y1 - w * ny
               var z5 = z1
               arr[npts + 0] = 2 * x3 / width - 1
               arr[npts + 1] = 2 * y3 / width - 1
               arr[npts + 2] = 2 * z3 / width
               arr[npts + 3] = 2 * x4 / width - 1
               arr[npts + 4] = 2 * y4 / width - 1
               arr[npts + 5] = 2 * z4 / width
               arr[npts + 6] = 2 * x5 / width - 1
               arr[npts + 7] = 2 * y5 / width - 1
               arr[npts + 8] = 2 * z5 / width
               npts += 9
               var x3 = x1 - w * nx
               var y3 = y1 - w * ny
               var z3 = z1
               var x4 = x2 + w * nx - a * dx
               var y4 = y2 + w * ny - a * dy
               var z4 = z2 - a * dz
               var x5 = x2 - w * nx - a * dx
               var y5 = y2 - w * ny - a * dy
               var z5 = z2 - a * dz
               arr[npts + 0] = 2 * x3 / width - 1
               arr[npts + 1] = 2 * y3 / width - 1
               arr[npts + 2] = 2 * z3 / width
               arr[npts + 3] = 2 * x4 / width - 1
               arr[npts + 4] = 2 * y4 / width - 1
               arr[npts + 5] = 2 * z4 / width
               arr[npts + 6] = 2 * x5 / width - 1
               arr[npts + 7] = 2 * y5 / width - 1
               arr[npts + 8] = 2 * z5 / width
               npts += 9
               var x3 = x2 + a * (.5 * nx - dx)
               var y3 = y2 + a * (.5 * ny - dy)
               var z3 = z2 - a * dz
               var x4 = x2 + a * (-.5 * nx - dx)
               var y4 = y2 + a * (-.5 * ny - dy)
               var z4 = z2 - a * dz
               arr[npts + 0] = 2 * x2 / width - 1
               arr[npts + 1] = 2 * y2 / width - 1
               arr[npts + 2] = 2 * z2 / width
               arr[npts + 3] = 2 * x3 / width - 1
               arr[npts + 4] = 2 * y3 / width - 1
               arr[npts + 5] = 2 * z3 / width
               arr[npts + 6] = 2 * x4 / width - 1
               arr[npts + 7] = 2 * y4 / width - 1
               arr[npts + 8] = 2 * z4 / width
               npts += 9
            }
            return npts
         }
         //
         // function to add 2D arrow vertices
         //

         function arrow2(x1, y1, x2, y2, w, a, arr, npts) {
            var dx = x2 - x1
            var dy = y2 - y1
            var d = Math.sqrt(dx * dx + dy * dy)
            if (d > 0) {
               dx = dx / d
               dy = dy / d
               var nx = dy
               var ny = -dx
               var x3 = x1 + w * nx
               var y3 = y1 + w * ny
               var x4 = x2 + w * nx - a * dx
               var y4 = y2 + w * ny - a * dy
               var x5 = x1 - w * nx
               var y5 = y1 - w * ny
               arr[npts + 0] = 2 * x3 / width - 1
               arr[npts + 1] = 2 * y3 / width - 1
               arr[npts + 2] = 0
               arr[npts + 3] = 2 * x4 / width - 1
               arr[npts + 4] = 2 * y4 / width - 1
               arr[npts + 5] = 0
               arr[npts + 6] = 2 * x5 / width - 1
               arr[npts + 7] = 2 * y5 / width - 1
               arr[npts + 8] = 0
               npts += 9
               var x3 = x1 - w * nx
               var y3 = y1 - w * ny
               var x4 = x2 + w * nx - a * dx
               var y4 = y2 + w * ny - a * dy
               var x5 = x2 - w * nx - a * dx
               var y5 = y2 - w * ny - a * dy
               arr[npts + 0] = 2 * x3 / width - 1
               arr[npts + 1] = 2 * y3 / width - 1
               arr[npts + 2] = 0
               arr[npts + 3] = 2 * x4 / width - 1
               arr[npts + 4] = 2 * y4 / width - 1
               arr[npts + 5] = 0
               arr[npts + 6] = 2 * x5 / width - 1
               arr[npts + 7] = 2 * y5 / width - 1
               arr[npts + 8] = 0
               npts += 9
               var x3 = x2 + a * (.5 * nx - dx)
               var y3 = y2 + a * (.5 * ny - dy)
               var x4 = x2 + a * (-.5 * nx - dx)
               var y4 = y2 + a * (-.5 * ny - dy)
               arr[npts + 0] = 2 * x2 / width - 1
               arr[npts + 1] = 2 * y2 / width - 1
               arr[npts + 2] = 0
               arr[npts + 3] = 2 * x3 / width - 1
               arr[npts + 4] = 2 * y3 / width - 1
               arr[npts + 5] = 0
               arr[npts + 6] = 2 * x4 / width - 1
               arr[npts + 7] = 2 * y4 / width - 1
               arr[npts + 9] = 0
               npts += 9
            }
            return npts
         }
         //
         // count points
         //
         var npts = 0
         for (var seg = 0; seg < path.length; ++seg)
            npts += path[seg].length
         var segments = new Float32Array(3 * 9 * npts)
         //
         // add segments
         // todo: trim to actual size
         //
         npts = 0
         var w = width / 2500
         var a = 10 * w
         if (path[0][0].length == 2) {
            for (var seg = 0; seg < path.length; ++seg) {
               for (var pt = 1; pt < path[seg].length; ++pt) {
                  var x1 = path[seg][pt - 1][X]
                  var y1 = path[seg][pt - 1][Y] + width - height
                  var x2 = path[seg][pt][X]
                  var y2 = path[seg][pt][Y] + width - height
                  npts = arrow2(x1, y1, x2, y2, w, a, segments, npts)
               }
            }
         } else if (path[0][0].length == 3) {
            for (var seg = 0; seg < path.length; ++seg) {
               for (var pt = 1; pt < path[seg].length; ++pt) {
                  var x1 = path[seg][pt - 1][X]
                  var y1 = path[seg][pt - 1][Y] + width - height
                  var z1 = path[seg][pt - 1][Z]
                  var x2 = path[seg][pt][X]
                  var y2 = path[seg][pt][Y] + width - height
                  var z2 = path[seg][pt][Z]
                  npts = arrow3(x1, y1, z1, x2, y2, z2, w, a, segments, npts)
               }
            }
         }
         var seg_buffer = gl.createBuffer()
         gl.bindBuffer(gl.ARRAY_BUFFER, seg_buffer)
         gl.bufferData(gl.ARRAY_BUFFER, segments, gl.STATIC_DRAW)
         //
         // add connections
         // todo: trim to actual size
         //
         var connections = new Float32Array(3 * 9 * path.length)
         var nconns = 0
         if (path[0][0].length == 2) {
            for (var seg = 1; seg < path.length; ++seg) {
               var x1 = path[seg - 1][path[seg - 1].length - 1][X]
               var y1 = path[seg - 1][path[seg - 1].length - 1][Y] + width - height
               var x2 = path[seg][0][X]
               var y2 = path[seg][0][Y] + width - height
               nconns = arrow2(x1, y1, x2, y2, w, a, connections, nconns)
            }
         } else if (path[0][0].length == 3) {
            for (var seg = 1; seg < path.length; ++seg) {
               var x1 = path[seg - 1][path[seg - 1].length - 1][X]
               var y1 = path[seg - 1][path[seg - 1].length - 1][Y] + width - height
               var z1 = path[seg - 1][path[seg - 1].length - 1][Z]
               var x2 = path[seg][0][X]
               var y2 = path[seg][0][Y] + width - height
               var z2 = path[seg][0][Z]
               nconns = arrow3(x1, y1, z1, x2, y2, z2, w, a, connections, nconns)
            }
         }
         var conn_buffer = gl.createBuffer()
         gl.bindBuffer(gl.ARRAY_BUFFER, conn_buffer)
         gl.bufferData(gl.ARRAY_BUFFER, connections, gl.STATIC_DRAW)
         //
         // add axes
         //
         var xaxis = new Float32Array(3 * 9)
         var yaxis = new Float32Array(3 * 9)
         var zaxis = new Float32Array(3 * 9)
         var x0 = 0
         var y0 = width - height
         var z0 = 0
         var d = width / 10
         arrow3(x0, y0, z0, x0 + d, y0, z0, w, a, xaxis, 0)
         arrow3(x0, y0, z0, x0, y0 + d, z0, w, a, yaxis, 0)
         arrow3(x0, y0, z0, x0, y0, z0 + d, w, a, zaxis, 0)
         var xaxis_buffer = gl.createBuffer()
         gl.bindBuffer(gl.ARRAY_BUFFER, xaxis_buffer)
         gl.bufferData(gl.ARRAY_BUFFER, xaxis, gl.STATIC_DRAW)
         var yaxis_buffer = gl.createBuffer()
         gl.bindBuffer(gl.ARRAY_BUFFER, yaxis_buffer)
         gl.bufferData(gl.ARRAY_BUFFER, yaxis, gl.STATIC_DRAW)
         var zaxis_buffer = gl.createBuffer()
         gl.bindBuffer(gl.ARRAY_BUFFER, zaxis_buffer)
         gl.bufferData(gl.ARRAY_BUFFER, zaxis, gl.STATIC_DRAW)
         //
         // enable depth testing
         //
         //gl.enable(gl.DEPTH_TEST)
         //gl.depthFunc(gl.LEQUAL)
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
               // draw segments
               //
               gl.uniform3f(ucolor, 0, 0, 0.25)
               gl.bindBuffer(gl.ARRAY_BUFFER, seg_buffer)
               gl.vertexAttribPointer(vertexPosition, 3.0, gl.FLOAT, false, 0, 0)
               gl.drawArrays(gl.TRIANGLES, 0, segments.length / 3.0)
               //
               // draw connections
               //
               if (show_connections) {
                  gl.uniform3f(ucolor, 1.0, 0, 0)
                  gl.bindBuffer(gl.ARRAY_BUFFER, conn_buffer)
                  gl.vertexAttribPointer(vertexPosition, 3.0, gl.FLOAT, false, 0, 0)
                  gl.drawArrays(gl.TRIANGLES, 0, connections.length / 3.0)
               }
               //
               // draw axes
               //
               gl.uniform3f(ucolor, 0, 0, 1.0)
               gl.bindBuffer(gl.ARRAY_BUFFER, xaxis_buffer)
               gl.vertexAttribPointer(vertexPosition, 3.0, gl.FLOAT, false, 0, 0)
               gl.drawArrays(gl.TRIANGLES, 0, xaxis.length / 3.0)
               gl.uniform3f(ucolor, 0, 1.0, 0)
               gl.bindBuffer(gl.ARRAY_BUFFER, yaxis_buffer)
               gl.vertexAttribPointer(vertexPosition, 3.0, gl.FLOAT, false, 0, 0)
               gl.drawArrays(gl.TRIANGLES, 0, yaxis.length / 3.0)
               gl.uniform3f(ucolor, 1.0, 0, 0)
               gl.bindBuffer(gl.ARRAY_BUFFER, zaxis_buffer)
               gl.vertexAttribPointer(vertexPosition, 3.0, gl.FLOAT, false, 0, 0)
               gl.drawArrays(gl.TRIANGLES, 0, zaxis.length / 3.0)
               //
               // flush
               //      
               gl.flush()
            }
      }

   return {
      show_gl: mod_path_show_gl
   }

});
