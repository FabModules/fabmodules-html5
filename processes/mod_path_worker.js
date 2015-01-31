//
// mod_path_worker.js
//   fab modules path Web Worker
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
// add listener
//
self.addEventListener('message', function(e) {
   var ret = fn[e.data[0]](e.data)
   self.postMessage(['return', ret])
}, false)
//
// define colors
//
var R = 0
var G = 1
var B = 2
var A = 3
//
// define word 0 states
//
var STATE = 0
var EMPTY = 0
var INTERIOR = (1 << 0)
var EDGE = (1 << 1)
var START = (1 << 2)
var STOP = (1 << 3)
//
// define word 1 directions
//
var DIRECTION = 1
var NONE = 0
var NORTH = (1 << 0)
var SOUTH = (1 << 1)
var EAST = (1 << 2)
var WEST = (1 << 3)
//
// define axes
//
var X = 0
var Y = 1
var Z = 2
//
// set up function object
//
var fn = {}
//
// mod_path_worker_get
//    get image value

   function mod_path_worker_get(row, col, element) {
      return this.data[(this.height - 1 - row) * this.width * 4 + col * 4 + element]
   }
   //
   // mod_path_worker_set
   //   set image value
   //

   function mod_path_worker_set(row, col, element, value) {
      this.data[(this.height - 1 - row) * this.width * 4 + col * 4 + element] = value
   }
   //
   // mod_path_worker_dir
   //    return number of site directions
   //

   function mod_path_worker_dir(row, col) {
      var num = 0
      if (this.get(row, col, DIRECTION) & NORTH) num += 1
      if (this.get(row, col, DIRECTION) & SOUTH) num += 1
      if (this.get(row, col, DIRECTION) & EAST) num += 1
      if (this.get(row, col, DIRECTION) & WEST) num += 1
      return num
   }
   //
   // mod_path_worker_find_distances
   //    find Euclidean distance to interior in a thresholded array
   //

   function mod_path_worker_find_distances(img) {
      img.get = mod_path_worker_get
      img.set = mod_path_worker_set
      var view = new DataView(img.data.buffer)
      var nx = img.width
      var ny = img.height

         function distance(g, x, y, i) {
            return ((y - i) * (y - i) + g[i][x] * g[i][x])
         }

         function intersection(g, x, y0, y1) {
            return ((g[y0][x] * g[y0][x] - g[y1][x] * g[y1][x] + y0 * y0 - y1 * y1) / (2.0 * (y0 - y1)))
         }
         //
         // allocate arrays
         //
      var g = []
      for (var y = 0; y < ny; ++y)
         g[y] = new Uint32Array(nx)
      var h = []
      for (var y = 0; y < ny; ++y)
         h[y] = new Uint32Array(nx)
      var distances = []
      for (var y = 0; y < ny; ++y)
         distances[y] = new Uint32Array(nx)
      var starts = new Uint32Array(ny)
      var minimums = new Uint32Array(ny)
      //
      // column scan
      //  
      for (var y = 0; y < ny; ++y) {
         //
         // right pass
         //
         var closest = -nx
         for (var x = 0; x < nx; ++x) {
            if (img.get(y, x, STATE) & INTERIOR) {
               g[y][x] = 0
               closest = x
            } else
               g[y][x] = (x - closest)
         }
         //
         // left pass
         //
         closest = 2 * nx
         for (var x = (nx - 1); x >= 0; --x) {
            if (img.get(y, x, STATE) & INTERIOR)
               closest = x
            else {
               var d = (closest - x)
               if (d < g[y][x])
                  g[y][x] = d
            }
         }
      }
      //
      // row scan
      //
      for (var x = 0; x < nx; ++x) {
         var segment = 0
         starts[0] = 0
         minimums[0] = 0
         //
         // down 
         //
         for (var y = 1; y < ny; ++y) {
            while ((segment >= 0) &&
               (distance(g, x, starts[segment], minimums[segment]) > distance(g, x, starts[segment], y)))
               segment -= 1
            if (segment < 0) {
               segment = 0
               minimums[0] = y
            } else {
               newstart = 1 + intersection(g, x, minimums[segment], y)
               if (newstart < ny) {
                  segment += 1
                  minimums[segment] = y
                  starts[segment] = newstart
               }
            }
         }
         //
         // up 
         //
         for (var y = (ny - 1); y >= 0; --y) {
            var d = Math.sqrt(distance(g, x, y, minimums[segment]))
            view.setUint32((img.height - 1 - y) * 4 * img.width + x * 4, d)
            if (y == starts[segment])
               segment -= 1
         }
      }
   }
   //
   // mod_path_worker_find_edges
   //    find edges
   //

   function mod_path_worker_find_edges(img) {
      img.get = mod_path_worker_get
      img.set = mod_path_worker_set
      //
      // check corners (todo)
      //
      //
      // check border
      //
      for (var row = 1; row < (img.height - 1); ++row) {
         col = 0
         if (img.get(row, col, STATE) & INTERIOR) {
            var sum =
               (img.get(row + 1, col, STATE) & INTERIOR) + (img.get(row + 1, col + 1, STATE) & INTERIOR) + (img.get(row, col + 1, STATE) & INTERIOR) + (img.get(row - 1, col + 1, STATE) & INTERIOR) + (img.get(row - 1, col, STATE) & INTERIOR)
            if (sum != 5) {
               img.set(row, col, STATE,
                  img.get(row, col, STATE) | EDGE)
            }
         }
         col = img.width - 1
         if (img.get(row, col, STATE) & INTERIOR) {
            var sum =
               (img.get(row + 1, col, STATE) & INTERIOR) + (img.get(row + 1, col - 1, STATE) & INTERIOR) + (img.get(row, col - 1, STATE) & INTERIOR) + (img.get(row - 1, col - 1, STATE) & INTERIOR) + (img.get(row - 1, col, STATE) & INTERIOR)
            if (sum != 5) {
               img.set(row, col, STATE,
                  img.get(row, col, STATE) | EDGE)
            }
         }
      }
      for (var col = 1; col < (img.width - 1); ++col) {
         row = 0
         if (img.get(row, col, STATE) & INTERIOR) {
            var sum =
               (img.get(row, col - 1, STATE) & INTERIOR) + (img.get(row + 1, col - 1, STATE) & INTERIOR) + (img.get(row + 1, col, STATE) & INTERIOR) + (img.get(row + 1, col + 1, STATE) & INTERIOR) + (img.get(row, col + 1, STATE) & INTERIOR)
            if (sum != 5) {
               img.set(row, col, STATE,
                  img.get(row, col, STATE) | EDGE)
            }
         }
         row = img.height - 1
         if (img.get(row, col, STATE) & INTERIOR) {
            var sum =
               (img.get(row, col - 1, STATE) & INTERIOR) + (img.get(row - 1, col - 1, STATE) & INTERIOR) + (img.get(row - 1, col, STATE) & INTERIOR) + (img.get(row - 1, col + 1, STATE) & INTERIOR) + (img.get(row, col + 1, STATE) & INTERIOR)
            if (sum != 5) {
               img.set(row, col, STATE,
                  img.get(row, col, STATE) | EDGE)
            }
         }
      }
      //
      // check body
      //
      for (var row = 1; row < (img.height - 1); ++row) {
         for (var col = 1; col < (img.width - 1); ++col) {
            if (img.get(row, col, STATE) & INTERIOR) {
               var sum =
                  (img.get(row, col - 1, STATE) & INTERIOR) + (img.get(row + 1, col - 1, STATE) & INTERIOR) + (img.get(row + 1, col, STATE) & INTERIOR) + (img.get(row + 1, col + 1, STATE) & INTERIOR) + (img.get(row, col + 1, STATE) & INTERIOR) + (img.get(row - 1, col + 1, STATE) & INTERIOR) + (img.get(row - 1, col, STATE) & INTERIOR) + (img.get(row - 1, col - 1, STATE) & INTERIOR)
               if (sum != 8) {
                  img.set(row, col, STATE,
                     img.get(row, col, STATE) | EDGE)
               }
            }
         }
      }
   }
   //
   // mod_path_worker_follow_edges
   //    follow image edges
   //

   function mod_path_worker_follow_edges(img, error) {
      //
      // edge follower
      //
      function follow_edges(row, col) {
         if (img.dir(row, col) != 0) {
            ++segments
            var x = col
            var y = row
            path[path.length] = [
               [x, y]
            ]
            while (1) {
               if (img.get(y, x, DIRECTION) & NORTH) {
                  img.set(y, x, DIRECTION,
                     img.get(y, x, DIRECTION) & ~NORTH)
                  y += 1
                  path[path.length - 1][path[path.length - 1].length] = [x, y]
               } else if (img.get(y, x, DIRECTION) & SOUTH) {
                  img.set(y, x, DIRECTION,
                     img.get(y, x, DIRECTION) & ~SOUTH)
                  y -= 1
                  path[path.length - 1][path[path.length - 1].length] = [x, y]
               } else if (img.get(y, x, DIRECTION) & EAST) {
                  img.set(y, x, DIRECTION,
                     img.get(y, x, DIRECTION) & ~EAST)
                  x += 1
                  path[path.length - 1][path[path.length - 1].length] = [x, y]
               } else if (img.get(y, x, DIRECTION) & WEST) {
                  img.set(y, x, DIRECTION,
                     img.get(y, x, DIRECTION) & ~WEST)
                  x -= 1
                  path[path.length - 1][path[path.length - 1].length] = [x, y]
               }
               if (img.dir(y, x) == 0) {
                  break
               }
            }
         }
      }
      img.get = mod_path_worker_get
      img.set = mod_path_worker_set
      img.dir = mod_path_worker_dir
      var segments = points = 0
      var path = []
      //
      // follow border starts
      //
      for (var row = 1; row < (img.height - 1); ++row) {
         col = 0
         follow_edges(row, col)
         col = img.width - 1
         follow_edges(row, col)
      }
      for (var col = 1; col < (img.width - 1); ++col) {
         row = 0
         follow_edges(row, col)
         row = img.height - 1
         follow_edges(row, col)
      }
      //
      // follow body paths
      //
      for (var row = 1; row < (img.height - 1); ++row) {
         for (var i = 1; i < (img.width - 1); ++i) {
            if (((row + 2) % 2) == 0)
               col = i
            else
               col = img.width - i - 1
            follow_edges(row, col)
         }
      }
      return path
   }
   //
   // mod_path_worker_image_2D_calculate
   //    path from image 2D calculate
   //
fn["mod_path_worker_image_2D_calculate"] = function(args) {
   var process_img = args[1]
   var output_img = args[2]
   var threshold = args[3]
   var number = args[4]
   var diameter = args[5]
   var overlap = args[6]
   var error = args[7]
   var direction = args[8]
   var sorting = args[9]
   var sort_merge = args[10]
   var sort_order_weight = args[11]
   var sort_sequence_weight = args[12]
   var dpi = args[13]
   //
   // threshold
   //
   self.postMessage(["prompt", 'threshold'])
   mod_path_worker_threshold(process_img, threshold)
   //
   // find distances
   //
   self.postMessage(["prompt", 'calculate distances'])
   mod_path_worker_find_distances(process_img)
   //
   // offset
   //
   var path = []
   var path_order = []
   var n = 0
   var distance = dpi * diameter / (2 * 25.4)
   while (1) {
      n += 1
      self.postMessage(["prompt", 'offset ' + n + '/' + number])
      mod_path_worker_offset(process_img, distance, output_img)
      //
      // find edges
      //
      mod_path_worker_find_edges(output_img)
      if (0) {
         //
         // show edge states (debugging)
         //
         mod_path_worker_image_show_states(output_img)
         self.postMessage(["image", output_img])
         return -1
      }
      //
      // orient edges
      //
      mod_path_worker_orient_edges(output_img)
      if (0) {
         //
         // show oriented states (debugging)
         //
         mod_path_worker_image_show_states(output_img)
         self.postMessage(["image", output_img])
         return -1
      }
      //
      // follow edges
      //
      var offset_path = mod_path_worker_follow_edges(output_img, error)
      if (offset_path.length > 0) {
         //
         // vectorize path
         //
         offset_path = mod_path_worker_vectorize2(offset_path, error)
         //
         // append path
         //
         path = path.concat(offset_path)
         var seg_order = new Array(offset_path.length)
         for (var i = 0; i < seg_order.length; ++i)
            seg_order[i] = n
         path_order = path_order.concat(seg_order)
      }
      //
      // loop
      //
      self.postMessage(["path", path])
      if ((n == number) || (offset_path.length == 0))
         break
      distance += (1 - overlap / 100) * dpi * diameter / 25.4
   }
   //
   // set direction
   //
   if (!direction) {
      for (var seg = 0; seg < path.length; ++seg) {
         for (var pt = 0; pt < (path[seg].length / 2); ++pt) {
            var temp = path[seg][pt]
            path[seg][pt] = path[seg][path[seg].length - pt - 1]
            path[seg][path[seg].length - pt - 1] = temp
         }
      }
   }
   //
   // sort path
   //
   if (sorting) {
      self.postMessage(["prompt", 'sort'])
      var sort_merge_distance = sort_merge * dpi * diameter / 25.4
      path = mod_path_worker_sort_weighted(path, path_order, sort_merge_distance, sort_order_weight, sort_sequence_weight)
   }
   //
   // return path
   //
   return path
}
//
// mod_path_worker_image_offset_z
//    z offset Int32 height image
//    todo: faster search
//
fn["mod_path_worker_image_offset_z"] = function(args) {
   var img = args[1]
   var dia = args[2]
   var overlap = args[3]
   var type = args[4]
   var xz = args[5]
   var yz = args[6]
   var error = args[7]
   var dpi = args[8]
   var bottom_z = args[9]
   var bottom_i = args[10]
   var top_z = args[11]
   var top_i = args[12]
   var view = new DataView(img.data.buffer)
   //
   // set height
   //
   self.postMessage(['prompt', 'set height'])
   mod_path_worker_image_set_height(img, bottom_z, bottom_i, top_z, top_i, dpi)
   //
   // set tool
   //
   var ir = Math.floor(0.5 + dpi * dia / (2 * 25.4))
   var id = Math.floor(0.5 + ((100 - overlap) / 100) * dpi * dia / 25.4)
   var tool = []
   for (var row = 0; row < 2 * ir; ++row) {
      for (var col = 0; col < 2 * ir; ++col) {
         var r = Math.sqrt((row - ir) * (row - ir) + (col - ir) * (col - ir))
         if (r < ir) {
            if (type) {
               //
               // flat end
               //
               tool[tool.length] = [row - ir, col - ir, 0]
            } else {
               //
               // ball end
               //
               var iz = Math.sqrt(ir * ir - ((row - ir) * (row - ir) + (col - ir) * (col - ir))) - ir
               tool[tool.length] = [row - ir, col - ir, iz]
            }
         }
      }
   }
   /*
   //
   // set clearance
   //
   var irc = Math.floor(0.5+dpi*clear_dia/(2*25.4))
   var ilc = Math.floor(0.5+dpi*clear_len/25.4)
   var clear = []
   for (var row = 0; row < 2*irc; ++row) {
      for (var col = 0; col < 2*irc; ++col) {
         var r = Math.sqrt((row-irc)*(row-irc)+(col-irc)*(col-irc))
         if ((r >= ir) && (r < irc))
            clear[clear.length] = [row-irc,col-irc,ilc]
         }
      }
   var collision = false
   */
   var path = []
   //
   // xz
   //
   if (xz) {
      var sign = 1
      path[path.length] = []
      for (var row = ir; row <= (img.height - ir); row += id) {
         self.postMessage(['prompt', 'row ' + row + '/' + img.height])
         var offset = 0 * (sign + 1) / 2 + (img.width - 1) * (1 - sign) / 2
         newpath = []
         for (var col = ir; col < (img.width - ir); ++col) {
            //
            // offset tool
            //
            var rcol = sign * col + offset
            var izmax = -1e10
            for (var t = 0; t < tool.length; ++t) {
               var iz = tool[t][2] +
                  view.getInt32((img.height - 1 - (row + tool[t][0])) * 4 * img.width + (rcol + tool[t][1]) * 4, false)
               if (iz > izmax)
                  izmax = iz
            }
            newpath[newpath.length] = [rcol, row, izmax]
            /*
            //
            // check clearance
            //
            for (var t = 0; t < clear.length; ++t) {
               var irow = row + clear[t][0]
               var icol = rcol + clear[t][1]
               if ((irow >= 0) && (icol >= 0) && (irow <= (img.height-1)) && (icol <= (img.width-1))) {
                  var d = izmax + clear[t][2] -
                     view.getInt32((img.height-1-irow)*4*img.width+icol*4,false)
                  if (d < 0)
                     collision = true
                  }
               }
            */
         }
         //
         // vectorize
         //
         newpath = mod_path_worker_vectorize3_segment(newpath, error)
         //
         // add to path
         //
         for (var pt = 0; pt < newpath.length; ++pt)
            path[path.length - 1][path[path.length - 1].length] = newpath[pt]
         self.postMessage(['path', path])
         sign = -sign
      }
   }
   //
   // yz
   //
   if (yz) {
      var sign = -1
      path[path.length] = []
      for (var col = ir; col <= (img.width - ir); col += id) {
         self.postMessage(['prompt', 'column ' + col + '/' + img.width])
         var offset = 0 * (sign + 1) / 2 + (img.height - 1) * (1 - sign) / 2
         newpath = []
         for (var row = ir; row < (img.height - ir); ++row) {
            //
            // offset tool
            //
            var rrow = sign * row + offset
            var izmax = -1e10
            for (var t = 0; t < tool.length; ++t) {
               var iz = tool[t][2] +
                  view.getInt32((img.height - 1 - (rrow + tool[t][0])) * 4 * img.width + (col + tool[t][1]) * 4, false)
               if (iz > izmax)
                  izmax = iz
            }
            newpath[newpath.length] = [col, rrow, izmax]
            //
            // check clearance
            //
         }
         //
         // vectorize
         //
         newpath = mod_path_worker_vectorize3_segment(newpath, error)
         //
         // add to path
         //
         for (var pt = 0; pt < newpath.length; ++pt)
            path[path.length - 1][path[path.length - 1].length] = newpath[pt]
         self.postMessage(['path', path])
         sign = -sign
      }
   }
   //
   // report collision
   //
   //self.postMessage(['collision',collision])
   //
   // return
   //
   return path
}
//
// mod_path_worker_image_set_height
//    set image intensity to Int32 height
//

function mod_path_worker_image_set_height(img, bottom_z, bottom_i, top_z, top_i, dpi) {
   img.get = mod_path_worker_get
   var view = new DataView(img.data.buffer)
   var imax = 256 * 256 * 256 - 1
   for (var row = 0; row < img.height; ++row) {
      for (var col = 0; col < img.width; ++col) {
         var intensity = (img.get(row, col, 0) + (img.get(row, col, 1) << 8) + (img.get(row, col, B) << 16)) / imax
         //var intensity = (img.get(row,col,R) + img.get(row,col,G)
         //   + img.get(row,col,B))/(3*255)
         var z = bottom_z + (top_z - bottom_z) * (intensity - bottom_i) / (top_i - bottom_i)
         var iz = Math.floor(0.5 + dpi * z / 25.4)
         view.setInt32((img.height - 1 - row) * 4 * img.width + col * 4, iz)
      }
   }
}
//
// mod_path_worker_image_show_distances
//    show Uint32 array distances
//   

function mod_path_worker_image_show_distances(img) {
   img.set = mod_image_set
   var view = new DataView(img)
   var imin = 1e10
   var imax = 0
   for (var row = 0; row < img.height; ++row) {
      for (var col = 0; col < img.width; ++col) {
         var value = view.getUint32((img.height - 1 - row) * img.width * 4 + col * 4, false)
         if (value > imax)
            imax = value
         if (value < imin)
            imin = value
      }
   }
   for (var row = 0; row < img.height; ++row) {
      for (var col = 0; col < img.width; ++col) {
         var value = 255 * (view.getUint32((img.height - 1 - row) * img.width * 4 + col * 4, false) - imin) / (imax - imin)
         img.set(row, col, R, value)
         img.set(row, col, G, value)
         img.set(row, col, B, value)
         img.set(row, col, A, 255)
      }
   }
}
//
// mod_path_worker_image_show_states
//    show states
//

function mod_path_worker_image_show_states(img) {
   img.get = function(row, col, element) {
      return this.data[(this.height - 1 - row) * this.width * 4 + col * 4 + element]
   }
   img.set = function(row, col, element, value) {
      this.data[(this.height - 1 - row) * this.width * 4 + col * 4 + element] = value
   }
   for (var row = 0; row < img.height; ++row) {
      for (var col = 0; col < img.width; ++col) {
         if (img.get(row, col, STATE) & START) {
            img.set(row, col, R, 128)
            img.set(row, col, G, 0)
            img.set(row, col, B, 0)
            img.set(row, col, A, 255)
         } else if (img.get(row, col, DIRECTION) & NORTH) {
            img.set(row, col, R, 255)
            img.set(row, col, G, 0)
            img.set(row, col, B, 0)
            img.set(row, col, A, 255)
         } else if (img.get(row, col, DIRECTION) & SOUTH) {
            img.set(row, col, R, 0)
            img.set(row, col, G, 255)
            img.set(row, col, B, 0)
            img.set(row, col, A, 255)
         } else if (img.get(row, col, DIRECTION) & EAST) {
            img.set(row, col, R, 0)
            img.set(row, col, G, 0)
            img.set(row, col, B, 255)
            img.set(row, col, A, 255)
         } else if (img.get(row, col, DIRECTION) & WEST) {
            img.set(row, col, R, 255)
            img.set(row, col, G, 255)
            img.set(row, col, B, 0)
            img.set(row, col, A, 255)
         } else if (img.get(row, col, STATE) & STOP) {
            img.set(row, col, R, 0)
            img.set(row, col, G, 128)
            img.set(row, col, B, 0)
            img.set(row, col, A, 255)
         } else if (img.get(row, col, STATE) & EDGE) {
            img.set(row, col, R, 255)
            img.set(row, col, G, 0)
            img.set(row, col, B, 255)
            img.set(row, col, A, 255)
         } else if (img.get(row, col, STATE) & INTERIOR) {
            img.set(row, col, R, 255)
            img.set(row, col, G, 255)
            img.set(row, col, B, 255)
            img.set(row, col, A, 255)
         } else { // EXTERIOR
            img.set(row, col, R, 0)
            img.set(row, col, G, 0)
            img.set(row, col, B, 0)
            img.set(row, col, A, 255)
         }
      }
   }
}
//
// mod_path_worker_offset
//    offset Uint32 distance array
//

function mod_path_worker_offset(distances, distance, img) {
   img.set = mod_path_worker_set
   var view = new DataView(distances.data.buffer)
   for (var row = 0; row < img.height; ++row) {
      for (var col = 0; col < img.width; ++col) {
         if (view.getUint32((distances.height - 1 - row) * distances.width * 4 + col * 4, false) <= distance)
            img.set(row, col, STATE, INTERIOR)
         else
            img.set(row, col, STATE, EMPTY)
         img.set(row, col, DIRECTION, NONE)
      }
   }
}
//
// mod_path_worker_orient_edges
//    orient edges
//

function mod_path_worker_orient_edges(img) {
   img.get = mod_path_worker_get
   img.set = mod_path_worker_set
   //
   // orient corners (todo)
   //
   //
   // orient border states
   //
   for (var row = 1; row < (img.height - 1); ++row) {
      col = 0
      if (img.get(row, col, STATE) & EDGE) {
         if ((img.get(row, col + 1, 0) & INTERIOR) &&
            (!(img.get(row + 1, col, 0) & INTERIOR) || !(img.get(row + 1, col + 1, 0) & INTERIOR))) {
            img.set(row, col, DIRECTION, EAST)
            img.set(row, col, STATE,
               img.get(row, col, STATE) | START)
         }
      }
      if (img.get(row, col, STATE) & EDGE) {
         if ((img.get(row + 1, col, 0) & INTERIOR) && !(img.get(row - 1, col, 0) & INTERIOR)) {
            img.set(row, col, DIRECTION, 0)
            img.set(row, col, STATE,
               img.get(row, col, STATE) | STOP)
         }
      }
      col = img.width - 1
      img.set(row, col, DIRECTION, 0)
      if (img.get(row, col, STATE) & EDGE) {
         if ((img.get(row, col - 1, 0) & INTERIOR) &&
            (!(img.get(row - 1, col, 0) & INTERIOR) || !(img.get(row - 1, col - 1, 0) & INTERIOR))) {
            img.set(row, col, DIRECTION, WEST)
            img.set(row, col, STATE,
               img.get(row, col, STATE) | START)
         }
      }
      if (img.get(row, col, STATE) & EDGE) {
         if ((img.get(row - 1, col, 0) & INTERIOR) && !(img.get(row + 1, col, 0) & INTERIOR)) {
            img.set(row, col, DIRECTION, 0)
            img.set(row, col, STATE,
               img.get(row, col, STATE) | STOP)
         }
      }
   }
   for (var col = 1; col < (img.width - 1); ++col) {
      row = 0
      img.set(row, col, DIRECTION, 0)
      if (img.get(row, col, STATE) & EDGE) {
         if ((img.get(row + 1, col, STATE) & INTERIOR) &&
            (!(img.get(row, col - 1, STATE) & INTERIOR) || !(img.get(row + 1, col - 1, STATE) & INTERIOR))) {
            img.set(row, col, DIRECTION, NORTH)
            img.set(row, col, STATE,
               img.get(row, col, STATE) | START)
         }
      }
      if (img.get(row, col, STATE) & EDGE) {
         if ((img.get(row, col - 1, 0) & INTERIOR) && !(img.get(row, col + 1, 0) & INTERIOR)) {
            img.set(row, col, DIRECTION, 0)
            img.set(row, col, STATE,
               img.get(row, col, STATE) | STOP)
         }
      }
      row = img.height - 1
      img.set(row, col, DIRECTION, 0)
      if (img.get(row, col, STATE) & EDGE) {
         if ((img.get(row - 1, col, STATE) & INTERIOR) &&
            (!(img.get(row, col + 1, 0) & INTERIOR) || !(img.get(row - 1, col + 1, 0) & INTERIOR))) {
            img.set(row, col, DIRECTION, SOUTH)
            img.set(row, col, STATE,
               img.get(row, col, STATE) | START)
         }
      }
      if (img.get(row, col, STATE) & EDGE) {
         if ((img.get(row, col + 1, 0) & INTERIOR) && !(img.get(row, col - 1, 0) & INTERIOR)) {
            img.set(row, col, DIRECTION, 0)
            img.set(row, col, STATE,
               img.get(row, col, STATE) | STOP)
         }
      }
   }
   //
   // orient body states
   //
   for (var row = 1; row < (img.height - 1); ++row) {
      for (var col = 1; col < (img.width - 1); ++col) {
         img.set(row, col, DIRECTION, 0)
         if (img.get(row, col, STATE) & EDGE) {
            if ((img.get(row + 1, col, STATE) & INTERIOR) &&
               (!(img.get(row, col - 1, STATE) & INTERIOR) || !(img.get(row + 1, col - 1, STATE) & INTERIOR))) {
               img.set(row, col, DIRECTION,
                  img.get(row, col, DIRECTION) | NORTH)
            }
            if ((img.get(row - 1, col, STATE) & INTERIOR) &&
               (!(img.get(row, col + 1, 0) & INTERIOR) || !(img.get(row - 1, col + 1, 0) & INTERIOR))) {
               img.set(row, col, DIRECTION,
                  img.get(row, col, DIRECTION) | SOUTH)
            }
            if ((img.get(row, col + 1, 0) & INTERIOR) &&
               (!(img.get(row + 1, col, 0) & INTERIOR) || !(img.get(row + 1, col + 1, 0) & INTERIOR))) {
               img.set(row, col, DIRECTION,
                  img.get(row, col, DIRECTION) | EAST)
            }
            if ((img.get(row, col - 1, 0) & INTERIOR) &&
               (!(img.get(row - 1, col, 0) & INTERIOR) || !(img.get(row - 1, col - 1, 0) & INTERIOR))) {
               img.set(row, col, DIRECTION,
                  img.get(row, col, DIRECTION) | WEST)
            }
         }
      }
   }
}
//
// mod_path_worker_sort_weighted
//    sort 2D path weighted
//    todo: more efficient sort
//

function mod_path_worker_sort_weighted(path, path_order, merge_distance, order_weight, sequence_weight) {
   if (path.length <= 1)
      return path
   var newpath = []
   if (sequence_weight > 0) {
      var istart = 0
      var iend = path.length - 1
      var x0 = path[0][path[0].length - 1][X]
      var y0 = path[0][path[0].length - 1][Y]
      newpath[newpath.length] = path[0]
      path.splice(0, 1)
      path_order.splice(0, 1)
      var endpath = path[path.length - 1]
      path.splice(path.length - 1, 1)
      path_order.splice(path_order.length - 1, 1)
   } else {
      var istart = path.length - 1
      var iend = 0
      var x0 = path[path.length - 1][path[path.length - 1].length - 1][X]
      var y0 = path[path.length - 1][path[path.length - 1].length - 1][Y]
      newpath[newpath.length] = path[path.length - 1]
      path.splice(path.length - 1, 1)
      path_order.splice(path_order.length - 1, 1)
      var endpath = path[0]
      path.splice(0, 1)
      path_order.splice(0, 1)
   }
   while (path.length > 0) {
      var dmin = Number.MAX_VALUE
      var wmin = Number.MAX_VALUE
      for (var seg = 0; seg < path.length; ++seg) {
         var x1 = path[seg][0][0]
         var y1 = path[seg][0][1]
         var d = (x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0)
         var w = (x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0) + order_weight * path_order[seg] + sequence_weight * (seg / path.length)
         if (w < wmin) {
            wmin = w
            dmin = d
            var segmin = seg
         }
      }
      x0 = path[segmin][path[segmin].length - 1][X]
      y0 = path[segmin][path[segmin].length - 1][Y]
      if (Math.sqrt(dmin) <= merge_distance)
         newpath[newpath.length - 1] = newpath[newpath.length - 1].concat(path[segmin])
      else
         newpath[newpath.length] = path[segmin]
      path.splice(segmin, 1)
      path_order.splice(segmin, 1)
   }
   newpath[newpath.length] = endpath
   return newpath
}
//
// mod_path_worker_threshold
//    threshold RGBA image, 0-1 range
//

function mod_path_worker_threshold(img, threshold) {
   img.get = mod_path_worker_get
   img.set = mod_path_worker_set
   var imax = 256 * 256 * 256 - 1
   for (var row = 0; row < img.height; ++row) {
      for (var col = 0; col < img.width; ++col) {
         //var intensity = (img.get(row,col,R) + img.get(row,col,G)
         //   + img.get(row,col,B))/3.0
         var intensity = (img.get(row, col, 0) + (img.get(row, col, 1) << 8) + (img.get(row, col, B) << 16)) / imax
         //if (intensity > (threshold*255))
         if (intensity > threshold)
            img.set(row, col, STATE, INTERIOR)
         else
            img.set(row, col, STATE, EMPTY)
         img.set(row, col, DIRECTION, NONE)
      }
   }
}
//
// mod_path_worker_vectorize2
//    vectorize 2D path
//

function mod_path_worker_vectorize2(oldpath, error) {
   var path = []
   var count = 0
   for (var seg = 0; seg < oldpath.length; ++seg) {
      var x0 = oldpath[seg][0][X]
      var y0 = oldpath[seg][0][Y]
      path[path.length] = [
         [x0, y0]
      ]
      count += 1
      var xsum = x0
      var ysum = y0
      var sum = 1
      for (var pt = 1; pt < oldpath[seg].length; ++pt) {
         var xold = x
         var yold = y
         var x = oldpath[seg][pt][X]
         var y = oldpath[seg][pt][Y]
         if (sum == 1) {
            xsum += x
            ysum += y
            sum += 1
         } else {
            var xmean = xsum / sum
            var ymean = ysum / sum
            var dx = xmean - x0
            var dy = ymean - y0
            var d = Math.sqrt(dx * dx + dy * dy)
            var nx = dy / d
            var ny = -dx / d
            var l = Math.abs(nx * (x - x0) + ny * (y - y0))
            if (l < error) {
               xsum += x
               ysum += y
               sum += 1
            } else {
               path[path.length - 1][path[path.length - 1].length] = [xold, yold]
               count += 1
               x0 = xold
               y0 = yold
               xsum = xold
               ysum = yold
               sum = 1
            }
         }
         if (pt == (oldpath[seg].length - 1)) {
            path[path.length - 1][path[path.length - 1].length] = [x, y]
            count += 1
         }
      }
   }
   return path
}
//
// mod_path_worker_vectorize3
//    vectorize 3D path
//

function mod_path_worker_vectorize3(oldpath, error) {
   var path = []
   var count = 0
   for (var seg = 0; seg < oldpath.length; ++seg) {
      var x0 = oldpath[seg][0][X]
      var y0 = oldpath[seg][0][Y]
      var z0 = oldpath[seg][0][Z]
      path[path.length] = [
         [x0, y0, z0]
      ]
      count += 1
      var xsum = x0
      var ysum = y0
      var zsum = z0
      var sum = 1
      for (var pt = 1; pt < oldpath[seg].length; ++pt) {
         var xold = x
         var yold = y
         var zold = z
         var x = oldpath[seg][pt][X]
         var y = oldpath[seg][pt][Y]
         var z = oldpath[seg][pt][Z]
         if (sum == 1) {
            xsum += x
            ysum += y
            zsum += z
            sum += 1
         } else {
            var xmean = xsum / sum
            var ymean = ysum / sum
            var zmean = zsum / sum
            var dx = xmean - x0
            var dy = ymean - y0
            var dz = zmean - z0
            var d = Math.sqrt(dx * dx + dy * dy + dz * dz)
            var nx = dx / d
            var ny = dy / d
            var nz = dz / d
            var vx = (x - x0)
            var vy = (y - y0)
            var vz = (z - z0)
            var l = Math.sqrt((vx * vx + vy * vy + vz * vz) - (vx * nx + vy * ny + vz * nz) * (vx * nx + vy * ny + vz * nz))
            if (l < error) {
               xsum += x
               ysum += y
               zsum += z
               sum += 1
            } else {
               path[path.length - 1][path[path.length - 1].length] = [xold, yold, zold]
               count += 1
               x0 = xold
               y0 = yold
               z0 = zold
               xsum = xold
               ysum = yold
               zsum = zold
               sum = 1
            }
         }
         if (pt == (oldpath[seg].length - 1)) {
            path[path.length - 1][path[path.length - 1].length] = [x, y, z]
            count += 1
         }
      }
   }
   return path
}
//
// mod_path_worker_vectorize3_segment
//    vectorize 3D path segment
//

function mod_path_worker_vectorize3_segment(oldpath, error) {
   var path = []
   var count = 0
   var x0 = oldpath[0][X]
   var y0 = oldpath[0][Y]
   var z0 = oldpath[0][Z]
   path[path.length] = [x0, y0, z0]
   count += 1
   var xsum = x0
   var ysum = y0
   var zsum = z0
   var sum = 1
   for (var pt = 1; pt < oldpath.length; ++pt) {
      var xold = x
      var yold = y
      var zold = z
      var x = oldpath[pt][X]
      var y = oldpath[pt][Y]
      var z = oldpath[pt][Z]
      if (sum == 1) {
         xsum += x
         ysum += y
         zsum += z
         sum += 1
      } else {
         var xmean = xsum / sum
         var ymean = ysum / sum
         var zmean = zsum / sum
         var dx = xmean - x0
         var dy = ymean - y0
         var dz = zmean - z0
         var d = Math.sqrt(dx * dx + dy * dy + dz * dz)
         var nx = dx / d
         var ny = dy / d
         var nz = dz / d
         var vx = (x - x0)
         var vy = (y - y0)
         var vz = (z - z0)
         var l = Math.sqrt((vx * vx + vy * vy + vz * vz) - (vx * nx + vy * ny + vz * nz) * (vx * nx + vy * ny + vz * nz))
         if (l < error) {
            xsum += x
            ysum += y
            zsum += z
            sum += 1
         } else {
            path[path.length] = [xold, yold, zold]
            count += 1
            x0 = xold
            y0 = yold
            z0 = zold
            xsum = xold
            ysum = yold
            zsum = zold
            sum = 1
         }
      }
      if (pt == (oldpath.length - 1)) {
         path[path.length] = [x, y, z]
         count += 1
      }
   }
   return path
}
