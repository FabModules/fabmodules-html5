//
// mod_mesh.js
//   fab modules mesh routines
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
define(['mods/mod_globals','processes/mod_image'],
   function(globals) {
      var imageUtils = require('processes/mod_image')
      //
      // mod_mesh_height_map
      //    calculate height map from mesh
      //
      function mod_mesh_height_map(mesh, img) {
         img.get = imageUtils.get
         img.set = imageUtils.set
         //
         // clear array
         //
         var zclear = -1e10
         var view = new DataView(img.data.buffer)
         for (var row = 0; row < img.height; ++row)
            for (var col = 0; col < img.width; ++col)
               view.setFloat32(row * 4 * img.width + col * 4, zclear)
               //
               // set triangle heights
               //
         var rz = globals.mesh.rz
         var rx = globals.mesh.rx
         var dy = globals.mesh.dy
         var dx = globals.mesh.dx
         var s = globals.mesh.s
         var zlim = {
            zmin: 1e10,
            zmax: -1e10
         }
         for (var t = 0; t < mesh.length; ++t)
            mod_mesh_height_triangle(mesh[t], img, rz, rx, dy, dx, s, zlim)
         globals.zmin = 25.4 * (zlim.zmin - zlim.zmax) / globals.dpi
         //
         // set background
         //
         for (var row = 0; row < img.height; ++row)
            for (var col = 0; col < img.width; ++col) {
               var z = view.getFloat32((img.height - 1 - row) * 4 * img.width + col * 4)
               if (z == zclear)
                  view.setFloat32((img.height - 1 - row) * 4 * img.width + col * 4, zlim.zmin)
            }
            //
            // map height to intensity
            //
         var imax = 256 * 256 * 256 - 1
         for (var row = 0; row < img.height; ++row)
            for (var col = 0; col < img.width; ++col) {
               var z = view.getFloat32((img.height - 1 - row) * 4 * img.width + col * 4)
               var i = Math.floor(imax * (z - zlim.zmin) / (zlim.zmax - zlim.zmin))
               img.set(row, col, 0, (i & 255))
               img.set(row, col, 1, ((i >> 8) & 255))
               img.set(row, col, 2, ((i >> 16) & 255))
               img.set(row, col, 3, 255)
            }
      }
      //
      // mod_mesh_height_triangle
      //    add triangle to height map
      //

      function mod_mesh_height_triangle(t, img, rz, rx, dy, dx, s, zlim) {
         //
         // pos
         //    return vertex coordinates
         //
         function pos(v) {
            var x = 2 * (v[0] - globals.mesh.xmin) /
               (globals.mesh.xmax - globals.mesh.xmin) - 1
            var y = 2 * (v[1] - (globals.mesh.ymax + globals.mesh.ymin) / 2) /
               (globals.mesh.xmax - globals.mesh.xmin)
            var z = 2 * (v[2] - (globals.mesh.zmax + globals.mesh.zmin) / 2) /
               (globals.mesh.xmax - globals.mesh.xmin)
            var cz = Math.cos(rz)
            var sz = Math.sin(rz)
            var xrz = cz * x - sz * y
            var yrz = sz * x + cz * y
            var zrz = z
            var xrx = xrz
            var cx = Math.cos(rx)
            var sx = Math.sin(rx)
            var yrx = cx * yrz + sx * zrz
            var zrx = -sx * yrz + cx * zrz
            var xd = xrx + dx
            var yd = yrx + dy
            var zd = zrx
            var xs = xd * s
            var ys = yd * s
            var zs = zd
            var xn = Math.floor(0.5 + (img.width - 1) * (1 + xs) / 2)
            var yn = Math.floor(0.5 + (img.width - 1) * (1 + ys) / 2)
            var zf = Math.floor(0.5 + (img.width - 1) * (1 + zs) / 2)
            if (zf > zlim.zmax) zlim.zmax = zf
            if (zf < zlim.zmin) zlim.zmin = zf
            return {
               x: xn,
               y: yn,
               z: zf
            }
         }
         var p0 = pos(t[0])
         var x0 = p0.x
         var y0 = p0.y
         var z0 = p0.z
         var p1 = pos(t[1])
         var x1 = p1.x
         var y1 = p1.y
         var z1 = p1.z
         var p2 = pos(t[2])
         var x2 = p2.x
         var y2 = p2.y
         var z2 = p2.z
         //
         // check normal if needs to be drawn
         //
         if (((x1 - x0) * (y1 - y2) - (x1 - x2) * (y1 - y0)) >= 0)
            return
            //
            // sort projection order
            //
         if (y1 > y2) {
            var temp = x1;
            x1 = x2;
            x2 = temp
            var temp = y1;
            y1 = y2;
            y2 = temp
            var temp = z1;
            z1 = z2;
            z2 = temp
         }
         if (y0 > y1) {
            var temp = x0;
            x0 = x1;
            x1 = temp
            var temp = y0;
            y0 = y1;
            y1 = temp
            var temp = z0;
            z0 = z1;
            z1 = temp
         }
         if (y1 > y2) {
            var temp = x1;
            x1 = x2;
            x2 = temp
            var temp = y1;
            y1 = y2;
            y2 = temp
            var temp = z1;
            z1 = z2;
            z2 = temp
         }
         //
         // check orientation after sort
         //
         if (x1 < (x0 + ((x2 - x0) * (y1 - y0)) / (y2 - y0)))
            var dir = 1;
         else
            var dir = -1;
         //
         // set z values
         //
         var view = new DataView(img.data.buffer)
         if (y2 != y1) {
            for (var y = y1; y <= y2; ++y) {
               if (y < 0) continue
               if (y > (img.height - 1)) break
               x12 = Math.floor(0.5 + x1 + (y - y1) * (x2 - x1) / (y2 - y1))
               z12 = z1 + (y - y1) * (z2 - z1) / (y2 - y1)
               x02 = Math.floor(0.5 + x0 + (y - y0) * (x2 - x0) / (y2 - y0))
               z02 = z0 + (y - y0) * (z2 - z0) / (y2 - y0)
               if (x12 != x02)
                  var slope = (z02 - z12) / (x02 - x12)
               else
                  var slope = 0
               var x = x12 - dir
               while (x != x02) {
                  x += dir
                  if ((x < 0) || (x > (img.width - 1))) continue
                  var z = z12 + slope * (x - x12)
                  if (z > view.getFloat32((img.height - 1 - y) * 4 * img.width + x * 4))
                     view.setFloat32((img.height - 1 - y) * 4 * img.width + x * 4, z)
               }
            }
         }
         if (y1 != y0) {
            for (var y = y0; y <= y1; ++y) {
               if (y < 0) continue
               if (y > (img.height - 1)) break
               x01 = Math.floor(0.5 + x0 + (y - y0) * (x1 - x0) / (y1 - y0))
               z01 = z0 + (y - y0) * (z1 - z0) / (y1 - y0)
               x02 = Math.floor(0.5 + x0 + (y - y0) * (x2 - x0) / (y2 - y0))
               z02 = z0 + (y - y0) * (z2 - z0) / (y2 - y0)
               if (x01 != x02)
                  var slope = (z02 - z01) / (x02 - x01)
               else
                  var slope = 0
               var x = x01 - dir
               while (x != x02) {
                  x += dir
                  if ((x < 0) || (x > (img.width - 1))) continue
                  var z = z01 + slope * (x - x01)
                  if (z > view.getFloat32((img.height - 1 - y) * 4 * img.width + x * 4))
                     view.setFloat32((img.height - 1 - y) * 4 * img.width + x * 4, z)
               }
            }
         }
      }
      //
      // mod_mesh_march_rules
      //    marching cubes rule table
      //

      function mod_mesh_march_rules() {
         //
         // vertices:
         //   ---
         //   6 7
         //   4 5
         //   ---
         //   2 3
         //   0 1
         //   ---
         //  edges:
         //   ---
         //    k
         //   l j
         //    i
         //   ---
         //   h g
         //   e f
         //   ---
         //    c
         //   d b
         //    a
         //   ---
         //
         // add_rule
         //    add a rule and its variants to the table
         //
         function add_rule(rules, index, edges) {
            rules[index] = edges
            for (var i = 0; i < 4; ++i) {
               for (var j = 0; j < 4; ++j) {
                  for (var k = 0; k < 4; ++k) {
                     index = rotate_x(rules, index)
                  }
                  index = rotate_y(rules, index)
               }
               index = rotate_z(rules, index)
            }
         }
         //
         // b
         //    return string as binary
         //

         function b(num) {
            var v = 0
            for (var i = 0; i < num.length; ++i)
               if (num[num.length - i - 1] == '1')
                  v += Math.pow(2, i)
            return v
         }
         //
         // print_rules
         //    print the rule table
         //

         function print_rules(rules) {
            for (var i = 0; i < 256; ++i)
               console.log(i + ' ' + rules[i])
         }
         //
         // rotate_x
         //   rotate rule around x and add
         //

         function rotate_x(rules, index) {
            var new_index =
               (((index >> 4) & 1) << 0) + (((index >> 5) & 1) << 1) + (((index >> 0) & 1) << 2) + (((index >> 1) & 1) << 3) + (((index >> 6) & 1) << 4) + (((index >> 7) & 1) << 5) + (((index >> 2) & 1) << 6) + (((index >> 3) & 1) << 7)
            var new_rule = ''
            for (var i = 0; i < rules[index].length; ++i) {
               switch (rules[index][i]) {
                  case 'a':
                     new_rule += 'c';
                     break;
                  case 'b':
                     new_rule += 'g';
                     break;
                  case 'c':
                     new_rule += 'k';
                     break;
                  case 'd':
                     new_rule += 'h';
                     break;
                  case 'e':
                     new_rule += 'd';
                     break;
                  case 'f':
                     new_rule += 'b';
                     break;
                  case 'g':
                     new_rule += 'j';
                     break;
                  case 'h':
                     new_rule += 'l';
                     break;
                  case 'i':
                     new_rule += 'a';
                     break;
                  case 'j':
                     new_rule += 'f';
                     break;
                  case 'k':
                     new_rule += 'i';
                     break;
                  case 'l':
                     new_rule += 'e';
                     break;
                  case ' ':
                     new_rule += ' ';
                     break;
               }
            }
            rules[new_index] = new_rule
            return new_index
         }
         //
         // rotate_y
         //   rotate rule around y and add
         //

         function rotate_y(rules, index) {
            var new_index =
               (((index >> 1) & 1) << 0) + (((index >> 5) & 1) << 1) + (((index >> 3) & 1) << 2) + (((index >> 7) & 1) << 3) + (((index >> 0) & 1) << 4) + (((index >> 4) & 1) << 5) + (((index >> 2) & 1) << 6) + (((index >> 6) & 1) << 7)
            var new_rule = ''
            for (var i = 0; i < rules[index].length; ++i) {
               switch (rules[index][i]) {
                  case 'a':
                     new_rule += 'e';
                     break;
                  case 'b':
                     new_rule += 'd';
                     break;
                  case 'c':
                     new_rule += 'h';
                     break;
                  case 'd':
                     new_rule += 'l';
                     break;
                  case 'e':
                     new_rule += 'i';
                     break;
                  case 'f':
                     new_rule += 'a';
                     break;
                  case 'g':
                     new_rule += 'c';
                     break;
                  case 'h':
                     new_rule += 'k';
                     break;
                  case 'i':
                     new_rule += 'f';
                     break;
                  case 'j':
                     new_rule += 'b';
                     break;
                  case 'k':
                     new_rule += 'g';
                     break;
                  case 'l':
                     new_rule += 'j';
                     break;
                  case ' ':
                     new_rule += ' ';
                     break;
               }
            }
            rules[new_index] = new_rule
            return new_index
         }
         //
         // rotate_z
         //   rotate rule around z and add
         //

         function rotate_z(rules, index) {
            var new_index =
               (((index >> 2) & 1) << 0) + (((index >> 0) & 1) << 1) + (((index >> 3) & 1) << 2) + (((index >> 1) & 1) << 3) + (((index >> 6) & 1) << 4) + (((index >> 4) & 1) << 5) + (((index >> 7) & 1) << 6) + (((index >> 5) & 1) << 7)
            var new_rule = ''
            for (var i = 0; i < rules[index].length; ++i) {
               switch (rules[index][i]) {
                  case 'a':
                     new_rule += 'b';
                     break;
                  case 'b':
                     new_rule += 'c';
                     break;
                  case 'c':
                     new_rule += 'd';
                     break;
                  case 'd':
                     new_rule += 'a';
                     break;
                  case 'e':
                     new_rule += 'f';
                     break;
                  case 'f':
                     new_rule += 'g';
                     break;
                  case 'g':
                     new_rule += 'h';
                     break;
                  case 'h':
                     new_rule += 'e';
                     break;
                  case 'i':
                     new_rule += 'j';
                     break;
                  case 'j':
                     new_rule += 'k';
                     break;
                  case 'k':
                     new_rule += 'l';
                     break;
                  case 'l':
                     new_rule += 'i';
                     break;
                  case ' ':
                     new_rule += ' ';
                     break;
               }
            }
            rules[new_index] = new_rule
            return new_index
         }
         var rules = new Array(255)
         add_rule(rules, b('00000000'), "") // 0
         add_rule(rules, b('11111111'), "") // ~0
         add_rule(rules, b('00000001'), "eda") // 1
         add_rule(rules, b('11111110'), "ade") // ~1
         add_rule(rules, b('00000011'), "fed dbf") // 2
         add_rule(rules, b('11111100'), "def fbd") // ~2
         add_rule(rules, b('00100001'), "eda jif") // 3
         add_rule(rules, b('11011110'), "ade fij") // ~3
         add_rule(rules, b('10000001'), "eda gkj") // 4
         add_rule(rules, b('01111110'), "ade jkg") // ~4
         add_rule(rules, b('00001110'), "fhg fdh fad") // 5
         add_rule(rules, b('11110001'), "ghf hdf daf") // ~5
         add_rule(rules, b('10000011'), "fed fdb gkj") // 6
         add_rule(rules, b('01111100'), "def bdf jkg") // ~6
         add_rule(rules, b('10010010'), "bfa ile gkj") // 7
         add_rule(rules, b('01101101'), "afb eli jkg") // ~7
         add_rule(rules, b('00001111'), "ehg feg") // 8
         add_rule(rules, b('11110000'), "ghe gef") // ~8
         add_rule(rules, b('01001101'), "elk eka akg agb") // 9
         add_rule(rules, b('10110010'), "kle ake gka bga") // ~9
         add_rule(rules, b('10011001'), "ild ida ckj cjb") // 10
         add_rule(rules, b('01100110'), "dli adi jkc bjc") // ~10
         add_rule(rules, b('10001101'), "hkj hja hae ajb") // 11
         add_rule(rules, b('01110010'), "jkh ajh eah bja") // ~11
         add_rule(rules, b('00011110'), "ile hgf hfd dfa") // 12
         add_rule(rules, b('11100001'), "eli fgh dfh afd") // ~12
         add_rule(rules, b('01101001'), "eda bcg lkh jif") // 13
         add_rule(rules, b('10010110'), "ade gcb hkl fij") // ~13
         add_rule(rules, b('01001110'), "lkg lga lad agf") // 14
         add_rule(rules, b('10110001'), "gkl agl dal fga") // ~14
         return rules
      }
      //
      // mod_mesh_march_triangulate
      //    triangulate layer
      //

      function mod_mesh_march_triangulate(min_threshold, max_threshold, buf, ptr, nx, ny, nz, z) {
         //
         // vertex
         //    interpolate a triangle vertex
         //
         function vertex(c) {
            var v = new Array(3)
            switch (c) {
               case 'a':
                  v[0] = x + (w[0] - threshold) / (w[0] - w[1])
                  v[1] = y
                  v[2] = z
                  break
               case 'b':
                  v[0] = x + 1
                  v[1] = y + (w[1] - threshold) / (w[1] - w[3])
                  v[2] = z
                  break
               case 'c':
                  v[0] = x + (w[2] - threshold) / (w[2] - w[3])
                  v[1] = y + 1
                  v[2] = z
                  break
               case 'd':
                  v[0] = x
                  v[1] = y + (w[0] - threshold) / (w[0] - w[2])
                  v[2] = z
                  break
               case 'e':
                  v[0] = x
                  v[1] = y
                  v[2] = z + (w[0] - threshold) / (w[0] - w[4])
                  break
               case 'f':
                  v[0] = x + 1
                  v[1] = y
                  v[2] = z + (w[1] - threshold) / (w[1] - w[5])
                  break
               case 'g':
                  v[0] = x + 1
                  v[1] = y + 1
                  v[2] = z + (w[3] - threshold) / (w[3] - w[7])
                  break
               case 'h':
                  v[0] = x
                  v[1] = y + 1
                  v[2] = z + (w[2] - threshold) / (w[2] - w[6])
                  break
               case 'i':
                  v[0] = x + (w[4] - threshold) / (w[4] - w[5])
                  v[1] = y
                  v[2] = z + 1
                  break
               case 'j':
                  v[0] = x + 1
                  v[1] = y + (w[5] - threshold) / (w[5] - w[7])
                  v[2] = z + 1
                  break
               case 'k':
                  v[0] = x + (w[6] - threshold) / (w[6] - w[7])
                  v[1] = y + 1
                  v[2] = z + 1
                  break
               case 'l':
                  v[0] = x
                  v[1] = y + (w[4] - threshold) / (w[4] - w[6])
                  v[2] = z + 1
                  break
            }
            return v
         }
         //
         // triangulate_min
         //    triangulate a voxel minimum threshold
         //

         function triangulate_min() {
            //
            // set rule table index
            //
            index = 0
            if (w[0] < threshold) index += 1
            if (w[1] < threshold) index += 2
            if (w[2] < threshold) index += 4
            if (w[3] < threshold) index += 8
            if (w[4] < threshold) index += 16
            if (w[5] < threshold) index += 32
            if (w[6] < threshold) index += 64
            if (w[7] < threshold) index += 128
            //
            // loop over rule chars
            //
            var rule = globals.mesh.rules[index]
            i = 0;
            while (i < rule.length) {
               if (rule[i] == ' ') {
                  //
                  // space between rules
                  //
                  i += 1
                  continue
               } else {
                  //
                  // add vertices for rule to mesh
                  //
                  var c0 = rule[i]
                  i += 1
                  var c1 = rule[i]
                  i += 1
                  var c2 = rule[i]
                  i += 1
                  mesh[mesh.length] = [vertex(c0), vertex(c1), vertex(c2)]
               }
            }
         }
         //
         // triangulate_max
         //    triangulate a voxel max threshold
         //

         function triangulate_max() {
            //
            // set rule table index
            //
            index = 0
            if (w[0] < threshold) index += 1
            if (w[1] < threshold) index += 2
            if (w[2] < threshold) index += 4
            if (w[3] < threshold) index += 8
            if (w[4] < threshold) index += 16
            if (w[5] < threshold) index += 32
            if (w[6] < threshold) index += 64
            if (w[7] < threshold) index += 128
            //
            // loop over rule chars
            //
            var rule = globals.mesh.rules[index]
            i = 0;
            while (i < rule.length) {
               if (rule[i] == ' ') {
                  //
                  // space between rules
                  //
                  i += 1
                  continue
               } else {
                  //
                  // add vertices for rule to mesh
                  //
                  var c0 = rule[i]
                  i += 1
                  var c1 = rule[i]
                  i += 1
                  var c2 = rule[i]
                  i += 1
                  mesh[mesh.length] = [vertex(c2), vertex(c1), vertex(c0)]
               }
            }
         }
         //
         // init layer mesh
         //
         var mesh = []
         mesh.xmin = 0
         mesh.xmax = nx
         mesh.ymin = 0
         mesh.ymax = ny
         mesh.zmin = 0
         mesh.zmax = nz
         //
         // set layer buffers
         //
         if (ptr == 0) {
            var bot = 1
            var top = 0
         } else {
            var bot = 0
            var top = 1
         }
         if (z == 0)
            buf[bot] = new Float32Array(nx * ny)
         else if (z == nz)
            buf[top] = new Float32Array(nx * ny)
            //
            // loop over layer
            //
         var w = new Array(8)
         for (var y = 0; y < (ny - 1); ++y) {
            for (var x = 0; x < (nx - 1); ++x) {
               w[0] = buf[bot][(ny - 1 - y) * nx + x]
               w[1] = buf[bot][(ny - 1 - y) * nx + (x + 1)]
               w[2] = buf[bot][(ny - 1 - (y + 1)) * nx + x]
               w[3] = buf[bot][(ny - 1 - (y + 1)) * nx + (x + 1)]
               w[4] = buf[top][(ny - 1 - y) * nx + x]
               w[5] = buf[top][(ny - 1 - y) * nx + (x + 1)]
               w[6] = buf[top][(ny - 1 - (y + 1)) * nx + x]
               w[7] = buf[top][(ny - 1 - (y + 1)) * nx + (x + 1)]
               var threshold = min_threshold
               triangulate_min()
               var threshold = max_threshold
               triangulate_max()
            }
         }
         //
         // loop over boundary
         //
         for (var y = 0; y < (ny - 1); ++y) {
            //
            // left
            //
            x = 0
            w[0] = 0
            w[1] = buf[bot][(ny - 1 - y) * nx + 0]
            w[2] = 0
            w[3] = buf[bot][(ny - 1 - (y + 1)) * nx + 0]
            w[4] = 0
            w[5] = buf[top][(ny - 1 - y) * nx + 0]
            w[6] = 0
            w[7] = buf[top][(ny - 1 - (y + 1)) * nx + 0]
            var threshold = min_threshold
            triangulate_min()
            var threshold = max_threshold
            triangulate_max()
            //
            // right
            //
            x = nx - 1
            w[0] = buf[bot][(ny - 1 - y) * nx + (nx - 1)]
            w[1] = 0
            w[2] = buf[bot][(ny - 1 - (y + 1)) * nx + (nx - 1)]
            w[3] = 0
            w[4] = buf[top][(ny - 1 - y) * nx + (nx - 1)]
            w[5] = 0
            w[6] = buf[top][(ny - 1 - (y + 1)) * nx + (nx - 1)]
            w[7] = 0
            var threshold = min_threshold
            triangulate_min()
            var threshold = max_threshold
            triangulate_max()
         }
         for (var x = 0; x < (nx - 1); ++x) {
            //
            // bottom
            //
            y = 0
            w[0] = 0
            w[1] = 0
            w[2] = buf[bot][(ny - 1 - (0)) * nx + x]
            w[3] = buf[bot][(ny - 1 - (0)) * nx + (x + 1)]
            w[4] = 0
            w[5] = 0
            w[6] = buf[top][(ny - 1 - (0)) * nx + x]
            w[7] = buf[top][(ny - 1 - (0)) * nx + (x + 1)]
            var threshold = min_threshold
            triangulate_min()
            var threshold = max_threshold
            triangulate_max()
            //
            // top
            //
            y = ny - 1
            w[0] = buf[bot][(ny - 1 - (ny - 1)) * nx + x]
            w[1] = buf[bot][(ny - 1 - (ny - 1)) * nx + (x + 1)]
            w[2] = 0
            w[3] = 0
            w[4] = buf[top][(ny - 1 - (ny - 1)) * nx + x]
            w[5] = buf[top][(ny - 1 - (ny - 1)) * nx + (x + 1)]
            w[6] = 0
            w[7] = 0
            var threshold = min_threshold
            triangulate_min()
            var threshold = max_threshold
            triangulate_max()
         }
         return mesh
      }


      return {
         'heightmap': mod_mesh_height_map,
         'height_map': mod_mesh_height_map,
         'height_triangle': mod_mesh_height_triangle,
         'march_rules': mod_mesh_march_rules,
         'march_triangulate': mod_mesh_march_triangulate,
      };

   });
