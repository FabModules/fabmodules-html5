//
// mod_image.js
//   fab modules image calculation routines
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

define(['mods/mod_globals', 'mods/mod_ui'],
   function(globals, ui) {

      //
      // define colors
      //
      var R = 0
      var G = 1
      var B = 2
      var A = 3
      //
      // mod_image_get
      //    get image value

         function mod_image_get(row, col, element) {
            return this.data[(this.height - 1 - row) * this.width * 4 + col * 4 + element]
         }
         //
         // mod_image_set
         //   set image value
         //

         function mod_image_set(row, col, element, value) {
            this.data[(this.height - 1 - row) * this.width * 4 + col * 4 + element] = value
         }
         //
         // mod_image_flatten
         //    remove transparency
         //

         function mod_image_flatten(img) {
            img.get = mod_image_get
            img.set = mod_image_set
            for (var row = 0; row < img.height; ++row) {
               for (var col = 0; col < img.width; ++col) {
                  if (img.get(row, col, A) != 255) {
                     img.set(row, col, R, 255)
                     img.set(row, col, G, 255)
                     img.set(row, col, B, 255)
                     img.set(row, col, A, 255)
                  }
               }
            }
         }
         //
         // mod_image_halftone
         //    halftone image
         //

         function mod_image_halftone(img, diameter, spot_size, spot_min, spot_spacing_h, spot_spacing_v, spot_points, spot_fill) {
            img.get = mod_image_get
            var dx = Math.floor(globals.dpi * spot_size * (1 + spot_spacing_h / 100) / (2 * 25.4))
            var dy = Math.floor(globals.dpi * spot_size * (1 + spot_spacing_v / 100) / (2 * 25.4))
            var r = Math.floor(globals.dpi * (spot_size / 2) / 25.4)
            var dr = Math.floor(globals.dpi * (diameter / 2) / 25.4)
            var rmin = Math.floor(r * spot_min / 100)
            var N = spot_points
            var row = Math.floor(dy)
            var col = Math.floor(dx)
            var delta = 2 * dx
            var path = []
            while (1) {
               if ((col + r) >= img.width) {
                  col -= 3 * dx
                  row += dy
                  delta = -2 * dx
               } else if ((col - r) < 0) {
                  col += dx
                  row += dy
                  delta = 2 * dx
               }
               if ((row + r) > globals.height)
                  return path
               var i = (img.get(row, col, R) + img.get(row, col, G) + img.get(row, col, B)) / (3 * 255)
               if ((i * (r - dr)) > rmin) {
                  path[path.length] = []
                  var radius = r - dr
                  while (radius > 0) {
                     for (var n = 0; n <= N; ++n) {
                        var angle = 2 * Math.PI * n / N
                        var x = Math.floor(col + i * radius * Math.cos(angle))
                        var y = Math.floor(row + i * radius * Math.sin(angle))
                        path[path.length - 1][path[path.length - 1].length] = [x, y]
                     }
                     if ((dr > 0) && spot_fill)
                        radius -= 2 * dr
                     else
                        break
                  }
               }
               col += delta
            }
         }
         //
         // mod_image_invert
         //    invert RGBA image data
         //

         function mod_image_invert(img) {
            ui.ui_clear()
            ui.ui_show_input()
            img.get = mod_image_get
            img.set = mod_image_set
            for (var row = 0; row < img.height; ++row) {
               for (var col = 0; col < img.width; ++col) {
                  img.set(row, col, R,
                     255 - img.get(row, col, R))
                  img.set(row, col, G,
                     255 - img.get(row, col, G))
                  img.set(row, col, B,
                     255 - img.get(row, col, B))
               }
            }
         }


      return {
         'get': mod_image_get,
         'set': mod_image_set,
         'invert': mod_image_invert,
         'flatten': mod_image_flatten,
         'halftone': mod_image_halftone
      };


   });
