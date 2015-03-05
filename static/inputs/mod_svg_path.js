//
// mod_svg_path.js
//   fab modules SVG path input
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
define(['require', 'mods/mod_ui', 'mods/mod_globals', 'outputs/mod_outputs', 'mods/mod_file'], function(require) {

   var ui = require('mods/mod_ui');
   var globals = require('mods/mod_globals');
   var outputs = require('outputs/mod_outputs');
   var fileUtils = require('mods/mod_file');
   var findEl = globals.findEl;

   var MAXWIDTH = 10000

   //
   // mod_load_handler
   //   file load handler
   //

      function mod_load_handler() {
         var file = findEl("mod_file_input")
         // file.setAttribute("onchange", "mod_svg_path_read_handler()")
         file.addEventListener("change", function() {
            mod_svg_path_read_handler();
         });
      }
      //
      // mod_svg_path_read_handler
      //    SVG path read handler
      //

      function mod_svg_path_read_handler(event) {
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
         file_reader.onload = mod_svg_path_text_load_handler
         file_reader.readAsText(globals.input_file)
      }
      //
      // mod_svg_path_text_load_handler
      //    SVG path text load handler
      //

      function mod_svg_path_text_load_handler(event) {
         //
         // set up UI
         //
         controls = findEl("mod_input_controls")

         controls.innerHTML = "<b>input</b><br>"
         var file_input = findEl("mod_file_input")
         controls.innerHTML += "file: " + globals.input_name + "<br>"
         controls.innerHTML += "size:<br>"
         controls.innerHTML += "<div id='mod_size'></div>"
         //
         // parse path
         //
         str = event.target.result
         result = mod_svg_path_parse(str)
         if (result == false)
            return
            //
            // display path
            //
            //
            // call outputs
            //
         ui.ui_prompt("output format?")
         outputs.init()
      }
      //
      // mod_svg_path_parse
      //    parse SVG path
      //

      function mod_svg_path_parse(str) {
         //
         // mm
         //    return dimension in mm and set units if found
         //
         function mm(str, ptr) {
            var start = 1 + str.indexOf("\"", ptr)
            var end = str.indexOf("\"", start + 1)
            var units = str.slice(end - 2, end)
            if (units == "px") {
               return (25.4 * parseFloat(str.slice(start, end - 2) / 90.0)) // Inkscape px default 90/inch
            } else if (units == "pt") {
               return (25.4 * parseFloat(str.slice(start, end - 2) / 72.0))
            } else if (units == "in") {
               return (25.4 * parseFloat(str.slice(start, end - 2)))
            } else if (units == "mm") {
               return (parseFloat(str.slice(start, end - 2)))
            } else if (units == "cm") {
               return (10.0 * parseFloat(str.slice(start, end - 2)))
            } else {
               return (parseFloat(str.slice(start, end)))
            }
         }
         //
         // strchr
         //    return first occurence of char in string, otherwise -1
         //

         function strchr(str, chr) {
            for (var i = 0; i < str.length; ++i) {
               if (str[i] == chr)
                  return i
            }
            return -1
         }
         //
         // next_number
         //    return next number after pointer
         //

         function next_number(str, ptr) {
            var haystack = "0123456789.-+"
            //
            // find start
            //
            var start = ptr
            while (1) {
               if (strchr(haystack, str[start]) != -1)
                  break
               ++start
            }
            //
            // find end
            //
            var end = start
            while (1) {
               if (strchr(haystack, str[end]) == -1)
                  break;
               ++end
            }
            return {
               value: parseFloat(str.slice(start, end)),
               index: end
            }
         }
         /*
         //
         // move pointer to end and return number
         //
         *number = strtod(*ptr,&end);
         *ptr = end;
         }
      */
         //
         // find SVG element
         //
         var ptr = str.indexOf("<svg")
         if (ptr == -1) {
            ui.ui_prompt("error: SVG element not found")
            return false
         }
         var stop = str.indexOf(">", ptr)
         //
         // get width and height
         //
         globals.dpi = 90 // Inkscape default for px
         var start = str.indexOf("width=", ptr)
         if ((start == -1) || (start > stop)) {
            ui.ui_prompt("error: no width")
            return false
         }
         var width = mm(str, start)
         var start = str.indexOf("height=", ptr)
         if ((start == -1) || (start > stop)) {
            ui.ui_prompt("error: no height")
            return false
         }
         var height = mm(str, start)
         var size = findEl('mod_size')
         size.innerHTML = "&nbsp;&nbsp;&nbsp;" + width.toFixed(3) + ' x ' + height.toFixed(3) + ' mm<br>'
         size.innerHTML += "&nbsp;&nbsp;&nbsp;" + (width / 25.4).toFixed(3) + ' x ' + (height / 25.4).toFixed(3) + ' in<br>'
         //
         // check for viewBox
         //
         var start = str.indexOf("viewBox=", ptr)
         if ((start == -1) || (start > stop)) {
            vxmin = 0
            vymin = 0
            vwidth = width
            vheight = height
         } else {
            var result = next_number(str, start)
            var vxmin = result.value
            var result = next_number(str, result.index)
            var vymin = result.value
            var result = next_number(str, result.index)
            var vwidth = result.value
            var result = next_number(str, result.index)
            var vheight = result.value
         }
         // console.log(vxmin)
//          console.log(vymin)
//          console.log(vwidth)
//          console.log(vheight)
      }


   return {
      mod_load_handler: mod_load_handler
   }


});


/*
      aspect = height/width;
      vaspect = vheight/vwidth;
      vxmid = vxmin + vwidth/2.0;
      vymid = vymin + vheight/2.0;
      // assume xMidYMid meet scaling
      if (vaspect > aspect) {
         ynscale = resolution*aspect/vheight;
         xnscale = ynscale;
         }
      else {
         xnscale = resolution/vwidth;
         ynscale = xnscale;
         }
      xnmid = resolution/2.0;
      ynmid = aspect*xnmid;
      }
   else {
      vxmid = width/2.0;
      vymid = height/2.0;
      xnscale = resolution/width;
      ynscale = xnscale;
      xnmid = xnscale*width/2.0;
      ynmid = ynscale*height/2.0;
      }
   */

/*
   //
   // get size
   //
   str = event.target.result
   var i = str.indexOf("width")
   if (i == -1) {
      ui.ui_prompt("error: SVG width not found")
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
   globals.dpi = 300
   globals.svg = {}
   globals.svg.units = units
   globals.svg.width = parseFloat(width)
   globals.svg.height = parseFloat(height)
   globals.width = parseInt(globals.dpi*width/units)
   globals.height = parseInt(globals.dpi*height/units)
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
   img.setAttribute("src",event.target.result)
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
      ctx.drawImage(img,0,0,img.width,img.height)
      var input_img = ctx.getImageData(0,0,canvas.width,canvas.height)
      mod_image_flatten(input_img)
      ctx.putImageData(input_img,0,0)
      controls = findEl("mod_input_controls")
      controls.innerHTML = "<b>input</b><br>"
      var file_input = findEl("mod_file_input")
      controls.innerHTML += "file: "+globals.input_name+"<br>"
      controls.innerHTML += "units/in: "
      controls.innerHTML += "<input type='text' id='mod_units' size='3' value="+globals.svg.units.toFixed(3)+" onkeyup='{\
         globals.svg.units = \
            parseFloat(findEl(\"mod_units\").value);\
         globals.width = \
            parseInt(globals.dpi*globals.svg.width/globals.svg.units);\
         globals.height = \
            parseInt(globals.dpi*globals.svg.height/globals.svg.units);\
         findEl(\"mod_px\").innerHTML = \
            globals.width+\" x \"+globals.height+\" px\";\
         findEl(\"mod_mm\").innerHTML = \
            (25.4*globals.width/globals.dpi).toFixed(3)+\" x \"+\
            (25.4*globals.height/globals.dpi).toFixed(3)+\" mm\";\
         findEl(\"mod_in\").innerHTML = \
            (globals.width/globals.dpi).toFixed(3)+\" x \"+\
            (globals.height/globals.dpi).toFixed(3)+\" in\";\
         mod_svg_reload();\
         }'><br>"
      controls.innerHTML += "width: "+globals.svg.width.toFixed(3)+"<br>"
      controls.innerHTML += "height: "+globals.svg.height.toFixed(3)+"<br>"
      controls.innerHTML += "dpi: "
      controls.innerHTML += "<input type='text' id='mod_dpi' size='3' value="+globals.dpi.toFixed(3)+" onkeyup='{\
         globals.dpi = \
            parseFloat(findEl(\"mod_dpi\").value);\
         globals.width = \
            parseInt(globals.dpi*globals.svg.width/globals.svg.units);\
         globals.height = \
            parseInt(globals.dpi*globals.svg.height/globals.svg.units);\
         findEl(\"mod_px\").innerHTML = \
            globals.width+\" x \"+globals.height+\" px\";\
         mod_svg_reload();\
         }'><br>"
      controls.innerHTML += "size:<br>"
      controls.innerHTML += "<span id='mod_px'>"+
         globals.width+" x "+globals.height+" px</span><br>"
      controls.innerHTML += "<span id='mod_mm'>"+
         (25.4*globals.width/globals.dpi).toFixed(3)+" x "+
         (25.4*globals.height/globals.dpi).toFixed(3)+" mm</span><br>"
      controls.innerHTML += "<span id='mod_in'>"+
         (globals.width/globals.dpi).toFixed(3)+" x "+
         (globals.height/globals.dpi).toFixed(3)+" in</span><br>"
      controls.innerHTML += "<input type='button' value='invert image' onclick='{\
         mod_ui_clear();\
         var canvas = findEl(\"mod_input_canvas\");\
         canvas.style.display = \"inline\";\
         var ctx = canvas.getContext(\"2d\");\
         var img = ctx.getImageData(0,0,canvas.width,canvas.height);\
         mod_image_invert(img);\
         ctx.putImageData(img,0,0);}'>"        
      }
   //
   // reader.readAsArrayBuffer(file)   
   //
   // call outputs
   //
   ui.ui_prompt("output format?")
   mod_outputs()
   }
//
// mod_svg_reload
//    reload SVG image
//
function mod_svg_reload() {
   mod_ui_clear()
   var img = new Image()
   img.setAttribute("src",globals.svg.svg)
   if (globals.width > MAXWIDTH) {
      ui.ui_prompt("error: image too large (greater than mod_svg MAXWIDTH)")
      return
      }
   else
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
      ctx.drawImage(img,0,0,img.width,img.height)
      var input_img = ctx.getImageData(0,0,canvas.width,canvas.height)
      mod_image_flatten(input_img)
      ctx.putImageData(input_img,0,0)
      }
   }
*/

/*
double angle(double ux, double uy, double vx, double vy) {
   double sign = (((ux*vy-uy*vx) > 0) ? 1 : -1);
   return (sign*acos((ux*vx+uy*vy)/(sqrt(ux*ux+uy*uy)*sqrt(vx*vx+vy*vy))));
   }
   
char next_element(char **ptr, char current_element) {
   //
   // return next path element after pointer
   //
   char number_haystack[] = "0123456789.-+";
   char element_haystack[] = "mMlLhHvVcCsSaAzZ\"";
   while (1) {
      if (strchr(element_haystack,**ptr) != NULL)
         return(**ptr);
      else if (strchr(number_haystack,**ptr) != NULL)
         return(current_element);
      else
         *ptr += 1;
      }
   }

void clear_transform(int *transform) {
   //
   // pop current transform from stack
   //
   *transform -= 1;
   }

int hex_int(char chr) {
   //
   // return hex for char
   //
   if (chr == '0') return 0;
   else if (chr == '1') return 1;
   else if (chr == '2') return 2;
   else if (chr == '3') return 3;
   else if (chr == '4') return 4;
   else if (chr == '5') return 5;
   else if (chr == '6') return 6;
   else if (chr == '7') return 7;
   else if (chr == '8') return 8;
   else if (chr == '9') return 9;
   else if ((chr == 'a') || (chr == 'A')) return 10;
   else if ((chr == 'b') || (chr == 'B')) return 11;
   else if ((chr == 'c') || (chr == 'C')) return 12;
   else if ((chr == 'd') || (chr == 'D')) return 13;
   else if ((chr == 'e') || (chr == 'e')) return 14;
   else if ((chr == 'f') || (chr == 'F')) return 15;
   printf("svg_path: oops -- non-hex char\n");
   exit(-1);
   }

void set_intensity(char *start, int *zn, struct fab_vars *v, int zsign) {
   char *end,*ptr;
   int r,g,b;
   float i;
   //
   // set zn from element intensity
   //
   end = strstr(start+1,">");
   ptr = strstr(start,"stroke:");
   if ((ptr != NULL) && (ptr < end)) {
      //
      // stroke found, check for hex encoding
      //
      ptr = strstr(ptr,"#");
      if ((ptr != NULL) && (ptr < end)) {
         //
         // hex encoding found, set intensity
         //
         r = 16*hex_int(ptr[1]) + hex_int(ptr[2]);
         g = 16*hex_int(ptr[3]) + hex_int(ptr[4]);
         b = 16*hex_int(ptr[5]) + hex_int(ptr[6]);
         if (zsign == 1)
            i = (r+g+b)/(255.0+255.0+255.0);
         else
            i = 1.0 - (r+g+b)/(255.0+255.0+255.0);
         *zn = i * (v->nz - 1);
         }
      else {
         //
         // hex encoding not found, set to bottom
         //
         *zn = 0;
         }
      }
   else {
      //
      // stroke not found, set to bottom
      //
      *zn = 0;
      }
   }

void set_transform(char *start, int *transform, double transforms[SVG_MAX_TRANSFORM][6]) {
   double a,b,c,d,e,f;
   double pi = 4*atan(1.0);
   char *end,*next,*ptr;
   //
   // push transform for current element onto stack
   //
   end = strstr(start+1,">");
   next = strstr(start+1,"<");
   if ((next != NULL) && (next < end))
      end = next;
   //
   // check for transform
   //
   ptr = strstr(start,"transform");
   if ((ptr != NULL) && (ptr < end)) {
      //
      // found, check for matrix
      //
      ptr = strstr(start,"matrix(");
      if ((ptr != NULL) && (ptr < end)) {
         //printf("trans: matrix\n");
         next_number(&ptr,&a);
         next_number(&ptr,&b);
         next_number(&ptr,&c);
         next_number(&ptr,&d);
         next_number(&ptr,&e);
         next_number(&ptr,&f);
         transforms[*transform][0] = a;
         transforms[*transform][1] = b;
         transforms[*transform][2] = c;
         transforms[*transform][3] = d;
         transforms[*transform][4] = e;
         transforms[*transform][5] = f;
         *transform += 1;
         return;
         }
      //
      // check for translate
      //
      ptr = strstr(start,"translate(");
      if ((ptr != NULL) && (ptr < end)) {
         //printf("trans: translate\n");
         next_number(&ptr,&e);
         next_number(&ptr,&f);
         transforms[*transform][0] = 1;
         transforms[*transform][1] = 0;
         transforms[*transform][2] = 0;
         transforms[*transform][3] = 1;
         transforms[*transform][4] = e;
         transforms[*transform][5] = f;
         *transform += 1;
         return;
         }
      //
      // check for scale
      //
      ptr = strstr(start,"scale(");
      if ((ptr != NULL) && (ptr < end)) {
         //printf("trans: scale\n");
         next_number(&ptr,&a);
         transforms[*transform][0] = a;
         transforms[*transform][1] = 0;
         transforms[*transform][2] = 0;
         transforms[*transform][3] = a;
         transforms[*transform][4] = 0;
         transforms[*transform][5] = 0;
         *transform += 1;
         return;
         }
      //
      // check for rotate
      //
      ptr = strstr(start,"rotate(");
      if ((ptr != NULL) && (ptr < end)) {
         //printf("trans: rotate\n");
         next_number(&ptr,&a);
         transforms[*transform][0] = cos(a*pi/180.0);
         transforms[*transform][1] = sin(a*pi/180.0);
         transforms[*transform][2] = -sin(a*pi/180.0);
         transforms[*transform][3] = cos(a*pi/180.0);
         transforms[*transform][4] = 0;
         transforms[*transform][5] = 0;
         *transform += 1;
         return;
         }
      //
      // check for skewX
      //
      ptr = strstr(start,"skewX(");
      if ((ptr != NULL) && (ptr < end)) {
         //printf("trans: skewX\n");
         next_number(&ptr,&a);
         transforms[*transform][0] = 1;
         transforms[*transform][1] = 0;
         transforms[*transform][2] = tan(a*pi/180.0);
         transforms[*transform][3] = 1;
         transforms[*transform][4] = 0;
         transforms[*transform][5] = 0;
         *transform += 1;
         return;
         }
      //
      // check for skewY
      //
      ptr = strstr(start,"skewY(");
      if ((ptr != NULL) && (ptr < end)) {
         //printf("trans: skewY\n");
         next_number(&ptr,&a);
         transforms[*transform][0] = 1;
         transforms[*transform][1] = tan(a*pi/180.0);
         transforms[*transform][2] = 0;
         transforms[*transform][3] = 1;
         transforms[*transform][4] = 0;
         transforms[*transform][5] = 0;
         *transform += 1;
         return;
         }
      //
      // didn't find transform
      //
      printf("svg_path: oops -- didn't find transform\n");
      transforms[*transform][0] = 1;
      transforms[*transform][1] = 0;
      transforms[*transform][2] = 0;
      transforms[*transform][3] = 1;
      transforms[*transform][4] = 0;
      transforms[*transform][5] = 0;
      *transform += 1;
      return;
      }
   else {
      //
      // transform not found, set unit transform
      //
      transforms[*transform][0] = 1;
      transforms[*transform][1] = 0;
      transforms[*transform][2] = 0;
      transforms[*transform][3] = 1;
      transforms[*transform][4] = 0;
      transforms[*transform][5] = 0;
      *transform += 1;
      return;
      }
   }

void path_point(int *xn, int *yn, double x, double y, int transform, double transforms[SVG_MAX_TRANSFORM][6],
   double xnscale, double ynscale, double xnmid, double vxmid, double ynmid, double vymid) {
   double xt,yt,xtemp,ytemp;
   int t;
   //
   // return path point
   //
   xt = x;
   yt = y;
   for (t = (transform-1); t >= 0; --t) {
      xtemp = transforms[t][0]*xt + transforms[t][2]*yt + transforms[t][4];
      ytemp = transforms[t][1]*xt + transforms[t][3]*yt + transforms[t][5];
      xt = xtemp;
      yt = ytemp;
      }
   *xn = xnmid + xnscale*(xt - vxmid);
   *yn = ynmid + ynscale*(yt - vymid);
   }

void fab_read_svg(struct fab_vars *v, char *input_file_name, float scale, int points, int resolution, float zmin, float zmax) {
   //
   // read SVG into fab_vars
   //
	FILE *input_file;
   char buf[SVG_MAX_FILE];
   char units[3];
   char current_element,last_element;
   int point,ret;
   char *ptr,*start,*stop,*endptr;
   int transform;
   double transforms[SVG_MAX_TRANSFORM][6];
   double unit_scale;
   double xnscale,ynscale,xnmid,ynmid;
   double vxmin,vymin,vxmid,vymid,vwidth,vheight,vaspect;
   double width,height,aspect;
   double x,y,z,x0,y0,x1,y1,x2,y2;
   double rx,ry,theta,theta_0,theta_1,theta_diff,rotation,large_arc,sweep;
   double phi,x1p,y1p,sign,cxp,cyp;
   double ax,bx,cx,ay,by,cy,xt,yt,t,r;
   double pi;
   int xn,yn,zn;
   int zsign;
   int count;
   pi = 4*atan(1.0);


   
   //
   // start path
   //
   v->nx = 2*xnmid;
   v->ny = 2*ynmid;
   v->dx = scale*width*unit_scale;
   v->dy = scale*height*unit_scale;
   v->xmin = 0;
   v->ymin = 0;
   zsign = 1;
   if (v->path->dof > 2) {
      if (zmin > zmax) {
         z = zmin;
         zmin = zmax;
         zmax = z;
         zsign = -1;
         }
      v->nz = 1+xnscale*(zmax-zmin);
      v->dz = zmax-zmin;
      v->zmin = zmin;
      }
   //
   // find graphic elements
   //
   ptr = buf;
   transform = 0;
   do {
      ptr += 1;
      if (strncmp(ptr,"<g",2) == 0) {
         //
         // opening g, check for transform and intensity
         //
         set_transform(ptr,&transform,transforms);
         set_intensity(ptr,&zn,v,zsign);
         }
      else if (strncmp(ptr,"/g>",2) == 0) {
         //
         // closing g, clear transform
         //
         clear_transform(&transform);
         }
      else if (strncmp(ptr,"<defs",5) == 0) {
         //
         // defs
         //
         while (1) {
            //
            // find closure
            //
            ptr +=1;
            if (strncmp(ptr,"/>",2) == 0)
               //
               // self-closing
               //
               break;
            else if (strncmp(ptr,">",1) == 0) {
               //
               // not self-closing
               //
               while (1) {
                  ptr += 1;
                  if (strncmp(ptr,"</defs>",7) == 0)
                     break;
                  }
               break;
               }
            }
         printf("   svg_path: defs not yet implemented\n");
         }
      else if (strncmp(ptr,"<image",6) == 0) {
         //
         // defs
         //
         while (1) {
            //
            // find closure
            //
            ptr +=1;
            if (strncmp(ptr,"/>",2) == 0)
               //
               // self-closing
               //
               break;
            else if (strncmp(ptr,">",1) == 0) {
               //
               // not self-closing
               //
               while (1) {
                  ptr += 1;
                  if (strncmp(ptr,"</image>",8) == 0)
                     break;
                  }
               break;
               }
            }
         printf("   svg_path: image not yet implemented\n");
         }
      else if (strncmp(ptr,"<path",5) == 0) {
         //
         // path
         //
         set_transform(ptr,&transform,transforms);
         set_intensity(ptr,&zn,v,zsign);
         ptr = 4+strstr(ptr," d=");
         current_element = 0;
         last_element = 0;
         x0 = 0;
         y0 = 0;
         do {
            last_element = current_element;
            current_element = next_element(&ptr, current_element);
            if (current_element == 'm') {
               //
               // relative moveto
               //
               next_number(&ptr,&x);
               next_number(&ptr,&y);
               x0 = x0 + x;
               y0 = y0 + y;
               //printf("   path m: %f %f\n",x0,y0);
               current_element = 'l';
               fab_path_segment(v);
               fab_path_point(v);
               path_point(&xn,&yn,x0,y0,transform,transforms,xnscale,ynscale,xnmid,vxmid,ynmid,vymid);
               fab_path_axis(v,xn);
               fab_path_axis(v,yn);
               if (v->path->dof > 2)
                  fab_path_axis(v,zn);
               }
            else if (current_element == 'M') {
               //
               // absolute moveto
               //
               next_number(&ptr,&x0);
               next_number(&ptr,&y0);
               //printf("  path M: %f %f\n",x0,y0);
               current_element = 'L';
               fab_path_segment(v);
               fab_path_point(v);
               path_point(&xn,&yn,x0,y0,transform,transforms,xnscale,ynscale,xnmid,vxmid,ynmid,vymid);
               fab_path_axis(v,xn);
               fab_path_axis(v,yn);
               if (v->path->dof > 2)
                  fab_path_axis(v,zn);
               }
            else if (current_element == 'l') {
               //
               // relative lineto
               //
               next_number(&ptr,&x);
               next_number(&ptr,&y);
               //printf("   path l: %f %f\n",x,y);
               current_element = 'l';
               fab_path_point(v);
               path_point(&xn,&yn,x0+x,y0+y,transform,transforms,xnscale,ynscale,xnmid,vxmid,ynmid,vymid);
               fab_path_axis(v,xn);
               fab_path_axis(v,yn);
               if (v->path->dof > 2)
                  fab_path_axis(v,zn);
               x0 = x0+x;
               y0 = y0+y;
               }
            else if (current_element == 'L') {
               //
               // absolute lineto
               //
               next_number(&ptr,&x);
               next_number(&ptr,&y);
               //printf("   path L: %f %f\n",x,y);
               current_element = 'L';
               fab_path_point(v);
               path_point(&xn,&yn,x,y,transform,transforms,xnscale,ynscale,xnmid,vxmid,ynmid,vymid);
               fab_path_axis(v,xn);
               fab_path_axis(v,yn);
               if (v->path->dof > 2)
                  fab_path_axis(v,zn);
               x0 = x;
               y0 = y;
               }
            else if (current_element == 'h') {
               //
               // relative horizontal
               //
               next_number(&ptr,&x);
               //printf("   path h: %f\n",x);
               current_element = 'j';
               fab_path_point(v);
               path_point(&xn,&yn,x0+x,y0,transform,transforms,xnscale,ynscale,xnmid,vxmid,ynmid,vymid);
               fab_path_axis(v,xn);
               fab_path_axis(v,yn);
               if (v->path->dof > 2)
                  fab_path_axis(v,zn);
               x0 = x0+x;
               }
            else if (current_element == 'H') {
               //
               // absolute horizontal
               //
               next_number(&ptr,&x);
               //printf("   path H: %f\n",x);
               current_element = 'H';
               fab_path_point(v);
               path_point(&xn,&yn,x,y0,transform,transforms,xnscale,ynscale,xnmid,vxmid,ynmid,vymid);
               fab_path_axis(v,xn);
               fab_path_axis(v,yn);
               if (v->path->dof > 2)
                  fab_path_axis(v,zn);
               x0 = x;
               }
            else if (current_element == 'v') {
               //
               // relative vertical
               //
               next_number(&ptr,&y);
               //printf("   path v: %f\n",y);
               current_element = 'v';
               fab_path_point(v);
               path_point(&xn,&yn,x0,y0+y,transform,transforms,xnscale,ynscale,xnmid,vxmid,ynmid,vymid);
               fab_path_axis(v,xn);
               fab_path_axis(v,yn);
               if (v->path->dof > 2)
                  fab_path_axis(v,zn);
               y0 = y0+y;
               }
            else if (current_element == 'V') {
               //
               // absolute vertical
               //
               next_number(&ptr,&y);
               //printf("   path V: %f\n",y);
               current_element = 'V';
               fab_path_point(v);
               path_point(&xn,&yn,x0,y,transform,transforms,xnscale,ynscale,xnmid,vxmid,ynmid,vymid);
               fab_path_axis(v,xn);
               fab_path_axis(v,yn);
               if (v->path->dof > 2)
                  fab_path_axis(v,zn);
               y0 = y;
               }
            else if (current_element == 'c') {
               //
               // relative curveto
               //
               next_number(&ptr,&x1);
               x1 += x0;
               next_number(&ptr,&y1);
               y1 += y0;
               next_number(&ptr,&x2);
               x2 += x0;
               next_number(&ptr,&y2);
               y2 += y0;
               next_number(&ptr,&x);
               x += x0;
               next_number(&ptr,&y);
               y += y0;
               //printf("   path c: %f %f %f %f %f %f\n",x1,y1,x2,y2,x,y);
               current_element = 'c';
               cx = 3 * (x1 - x0);
               bx = 3 * (x2 - x1) - cx;
               ax = x - x0 - cx - bx;
               cy = 3 * (y1 - y0);
               by = 3 * (y2 - y1) - cy;
               ay = y - y0 - cy - by;
               for (point = 0; point < points; ++point) {
                  t = point / (points - 1.0);
                  xt = ax*t*t*t + bx*t*t + cx*t + x0;
                  yt = ay*t*t*t + by*t*t + cy*t + y0;
                  fab_path_point(v);
                  path_point(&xn,&yn,xt,yt,transform,transforms,xnscale,ynscale,xnmid,vxmid,ynmid,vymid);
                  fab_path_axis(v,xn);
                  fab_path_axis(v,yn);
                  if (v->path->dof > 2)
                     fab_path_axis(v,zn);
                  }
               x0 = x;
               y0 = y;
               }
            else if (current_element == 'C') {
               //
               // absolute curveto
               //
               next_number(&ptr,&x1);
               next_number(&ptr,&y1);
               next_number(&ptr,&x2);
               next_number(&ptr,&y2);
               next_number(&ptr,&x);
               next_number(&ptr,&y);
               //printf(" path C: %f %f %f %f %f %f\n",x1,y1,x2,y2,x,y);
               current_element = 'C';
               cx = 3 * (x1 - x0);
               bx = 3 * (x2 - x1) - cx;
               ax = x - x0 - cx - bx;
               cy = 3 * (y1 - y0);
               by = 3 * (y2 - y1) - cy;
               ay = y - y0 - cy - by;
               for (point = 0; point < points; ++point) {
                  t = point / (points - 1.0);
                  xt = ax*t*t*t + bx*t*t + cx*t + x0;
                  yt = ay*t*t*t + by*t*t + cy*t + y0;
                  fab_path_point(v);
                  path_point(&xn,&yn,xt,yt,transform,transforms,xnscale,ynscale,xnmid,vxmid,ynmid,vymid);
                  fab_path_axis(v,xn);
                  fab_path_axis(v,yn);
                  if (v->path->dof > 2)
                     fab_path_axis(v,zn);
                  }
               x0 = x;
               y0 = y;
               }
            else if (current_element == 's') {
               //
               // relative smooth curveto
               //
               if ((last_element == 'c') || (last_element == 'C') || (last_element == 's') || (last_element == 'S')) {
                  x1 = x0 + (x0-x2);
                  y1 = y0 + (y0-y2);
                  }
               else {
                  x1 = x0;
                  y1 = y0;
                  }
               next_number(&ptr,&x2);
               x2 += x0;
               next_number(&ptr,&y2);
               y2 += y0;
               next_number(&ptr,&x);
               x += x0;
               next_number(&ptr,&y);
               y += y0;
               //printf("   path s: %f %f %f %f\n",x2,y2,x,y);
               current_element = 'c';
               cx = 3 * (x1 - x0);
               bx = 3 * (x2 - x1) - cx;
               ax = x - x0 - cx - bx;
               cy = 3 * (y1 - y0);
               by = 3 * (y2 - y1) - cy;
               ay = y - y0 - cy - by;
               for (point = 0; point < points; ++point) {
                  t = point / (points - 1.0);
                  xt = ax*t*t*t + bx*t*t + cx*t + x0;
                  yt = ay*t*t*t + by*t*t + cy*t + y0;
                  fab_path_point(v);
                  path_point(&xn,&yn,xt,yt,transform,transforms,xnscale,ynscale,xnmid,vxmid,ynmid,vymid);
                  fab_path_axis(v,xn);
                  fab_path_axis(v,yn);
                  if (v->path->dof > 2)
                     fab_path_axis(v,zn);
                  }
               x0 = x;
               y0 = y;
               }
            else if (current_element == 'S') {
               //
               // absolute smooth curveto
               //
               if ((last_element == 'c') || (last_element == 'C') || (last_element == 's') || (last_element == 'S')) {
                  x1 = x0 + (x0-x2);
                  y1 = y0 + (y0-y2);
                  }
               else {
                  x1 = x0;
                  y1 = y0;
                  }
               next_number(&ptr,&x2);
               next_number(&ptr,&y2);
               next_number(&ptr,&x);
               next_number(&ptr,&y);
               //printf(" path S: %f %f %f %f\n",x2,y2,x,y);
               current_element = 'C';
               cx = 3 * (x1 - x0);
               bx = 3 * (x2 - x1) - cx;
               ax = x - x0 - cx - bx;
               cy = 3 * (y1 - y0);
               by = 3 * (y2 - y1) - cy;
               ay = y - y0 - cy - by;
               for (point = 0; point < points; ++point) {
                  t = point / (points - 1.0);
                  xt = ax*t*t*t + bx*t*t + cx*t + x0;
                  yt = ay*t*t*t + by*t*t + cy*t + y0;
                  fab_path_point(v);
                  path_point(&xn,&yn,xt,yt,transform,transforms,xnscale,ynscale,xnmid,vxmid,ynmid,vymid);
                  fab_path_axis(v,xn);
                  fab_path_axis(v,yn);
                  if (v->path->dof > 2)
                     fab_path_axis(v,zn);
                  }
               x0 = x;
               y0 = y;
               }
            else if (current_element == 'a') {
               //
               // relative arc
               //
               next_number(&ptr,&rx);
               next_number(&ptr,&ry);
               next_number(&ptr,&rotation);
               next_number(&ptr,&large_arc);
               next_number(&ptr,&sweep);
               next_number(&ptr,&x);
               x += x0;
               next_number(&ptr,&y);
               y += y0;
               //printf("   path a: %f %f %f %f %f %f %f\n",rx,ry,rotation,large_arc,sweep,x,y);
               current_element = 'a';
               phi = rotation*pi/180.0;
               x1 = x0;
               x2 = x;
               y1 = y0;
               y2 = y;
               x1p = cos(phi)*(x1-x2)/2.0 + sin(phi)*(y1-y2)/2.0;
               y1p = -sin(phi)*(x1-x2)/2.0 + cos(phi)*(y1-y2)/2.0;
               sign = ((large_arc == sweep) ? -1 : 1);
               if ((rx*rx*ry*ry - rx*rx*y1p*y1p - ry*ry*x1p*x1p) < 0) {
                  cxp = 0;
                  cyp = 0;
                  }
               else {
                  cxp = sign * sqrt((rx*rx*ry*ry - rx*rx*y1p*y1p - ry*ry*x1p*x1p)/(rx*rx*y1p*y1p + ry*ry*x1p*x1p)) * rx*y1p/ry;
                  cyp = -1 * sign * sqrt((rx*rx*ry*ry - rx*rx*y1p*y1p - ry*ry*x1p*x1p)/(rx*rx*y1p*y1p + ry*ry*x1p*x1p)) * ry*x1p/rx;
                  }
               cx = cos(phi)*cxp - sin(phi)*cyp + (x1+x2)/2.0;
               cy = sin(phi)*cxp + cos(phi)*cyp + (y1+y2)/2.0;
               theta_0 = angle(1,0,(x1p-cxp)/rx,(y1p-cyp)/ry);
               theta_diff = angle ((x1p-cxp)/rx,(y1p-cyp)/ry,(-x1p-cxp)/rx,(-y1p-cyp)/ry);
               theta_1 = theta_0 + theta_diff;
               if (large_arc == 1) {
                  if (sweep == 0)
                     theta_1 -= 2*pi;
                  else
                     theta_1 += 2*pi;
                  }
               for (point = 0; point < points; ++point) {
                  theta = theta_0 + (theta_1-theta_0) * point / (points - 1.0);
                  xt = cx + rx*cos(theta);
                  yt = cy + ry*sin(theta);
                  fab_path_point(v);
                  path_point(&xn,&yn,xt,yt,transform,transforms,xnscale,ynscale,xnmid,vxmid,ynmid,vymid);
                  fab_path_axis(v,xn);
                  fab_path_axis(v,yn);
                  if (v->path->dof > 2)
                     fab_path_axis(v,zn);
                  }
               x0 = x;
               y0 = y;
               }
            else if (current_element == 'A') {
               //
               // absolute arc
               //
               next_number(&ptr,&rx);
               next_number(&ptr,&ry);
               next_number(&ptr,&rotation);
               next_number(&ptr,&large_arc);
               next_number(&ptr,&sweep);
               next_number(&ptr,&x);
               next_number(&ptr,&y);
               //printf("   path A: %f %f %f %f %f %f %f\n",rx,ry,rotation,large_arc,sweep,x,y);
               current_element = 'A';
               phi = rotation*pi/180.0;
               x1 = x0;
               x2 = x;
               y1 = y0;
               y2 = y;
               x1p = cos(phi)*(x1-x2)/2.0 + sin(phi)*(y1-y2)/2.0;
               y1p = -sin(phi)*(x1-x2)/2.0 + cos(phi)*(y1-y2)/2.0;
               sign = ((large_arc == sweep) ? -1 : 1);
               if ((rx*rx*ry*ry - rx*rx*y1p*y1p - ry*ry*x1p*x1p) < 0) {
                  cxp = 0;
                  cyp = 0;
                  }
               else {
                  cxp = sign * sqrt((rx*rx*ry*ry - rx*rx*y1p*y1p - ry*ry*x1p*x1p)/(rx*rx*y1p*y1p + ry*ry*x1p*x1p)) * rx*y1p/ry;
                  cyp = -1 * sign * sqrt((rx*rx*ry*ry - rx*rx*y1p*y1p - ry*ry*x1p*x1p)/(rx*rx*y1p*y1p + ry*ry*x1p*x1p)) * ry*x1p/rx;
                  }
               cx = cos(phi)*cxp - sin(phi)*cyp + (x1+x2)/2.0;
               cy = sin(phi)*cxp + cos(phi)*cyp + (y1+y2)/2.0;
               theta_0 = angle(1,0,(x1p-cxp)/rx,(y1p-cyp)/ry);
               theta_diff = angle ((x1p-cxp)/rx,(y1p-cyp)/ry,(-x1p-cxp)/rx,(-y1p-cyp)/ry);
               theta_1 = theta_0 + theta_diff;
               if (large_arc == 1) {
                  if (sweep == 0)
                     theta_1 -= 2*pi;
                  else
                     theta_1 += 2*pi;
                  }
               for (point = 0; point < points; ++point) {
                  theta = theta_0 + (theta_1-theta_0) * point / (points - 1.0);
                  xt = cx + rx*cos(theta);
                  yt = cy + ry*sin(theta);
                  fab_path_point(v);
                  path_point(&xn,&yn,xt,yt,transform,transforms,xnscale,ynscale,xnmid,vxmid,ynmid,vymid);
                  fab_path_axis(v,xn);
                  fab_path_axis(v,yn);
                  if (v->path->dof > 2)
                     fab_path_axis(v,zn);
                  }
               x0 = x;
               y0 = y;
               }
            else if ((current_element == 'z') || (current_element == 'Z')) {
               //
               // closepath
               //
               //printf("   path zZ\n");
               fab_path_point(v);
               fab_path_axis(v,v->path->segment->first->first->value);
               fab_path_axis(v,v->path->segment->first->first->next->value);
               if (v->path->dof > 2)
                  fab_path_axis(v,zn);
               current_element = 0;
               ptr += 1;
               }
            } while (*ptr != '\"');
         clear_transform(&transform);
         }
      else if (strncmp(ptr,"<rect",5) == 0) {
         //
         // rectangle
         //
         set_transform(ptr,&transform,transforms);
         set_intensity(ptr,&zn,v,zsign);
         start = strstr(ptr,"width=");
         next_number(&start,&width);
         start = strstr(ptr,"height=");
         next_number(&start,&height);
         start = strstr(ptr,"x=");
         next_number(&start,&x);
         start = strstr(ptr,"y=");
         next_number(&start,&y);
         while (strncmp(ptr,"/>",2) != 0) ptr += 1; // read to end of element
         //printf("   rect: %f %f %f %f\n",width,height,x,y);
         fab_path_segment(v);
            fab_path_point(v);
               path_point(&xn,&yn,x,y,transform,transforms,xnscale,ynscale,xnmid,vxmid,ynmid,vymid);
               fab_path_axis(v,xn);
               fab_path_axis(v,yn);
               if (v->path->dof > 2)
                  fab_path_axis(v,zn);
            fab_path_point(v);
               path_point(&xn,&yn,x,y+height,transform,transforms,xnscale,ynscale,xnmid,vxmid,ynmid,vymid);
               fab_path_axis(v,xn);
               fab_path_axis(v,yn);
               if (v->path->dof > 2)
                  fab_path_axis(v,zn);
            fab_path_point(v);
               path_point(&xn,&yn,x+width,y+height,transform,transforms,xnscale,ynscale,xnmid,vxmid,ynmid,vymid);
               fab_path_axis(v,xn);
               fab_path_axis(v,yn);
               if (v->path->dof > 2)
                  fab_path_axis(v,zn);
            fab_path_point(v);
               path_point(&xn,&yn,x+width,y,transform,transforms,xnscale,ynscale,xnmid,vxmid,ynmid,vymid);
               fab_path_axis(v,xn);
               fab_path_axis(v,yn);
               if (v->path->dof > 2)
                  fab_path_axis(v,zn);
            fab_path_point(v);
               path_point(&xn,&yn,x,y,transform,transforms,xnscale,ynscale,xnmid,vxmid,ynmid,vymid);
               fab_path_axis(v,xn);
               fab_path_axis(v,yn);
               if (v->path->dof > 2)
                  fab_path_axis(v,zn);
         clear_transform(&transform);
         }
      else if (strncmp(ptr,"<circle",7) == 0) {
         //
         // circle 
         //
         set_transform(ptr,&transform,transforms);
         set_intensity(ptr,&zn,v,zsign);
         start = strstr(ptr,"cx=");
         next_number(&start,&cx);
         start = strstr(ptr,"cy=");
         next_number(&start,&cy);
         start = strstr(ptr,"r=");
         next_number(&start,&r);
         while (strncmp(ptr,"/>",2) != 0) ptr += 1; // read to end of element
         //printf("   circle: %f %f %f\n",cx,cy,r);
         fab_path_segment(v);
         for (point = 0; point < points; ++point) {
            fab_path_point(v);
            x = cx + r*cos(point*2*pi/(points-1.0));
            y = cy + r*sin(point*2*pi/(points-1.0));
            path_point(&xn,&yn,x,y,transform,transforms,xnscale,ynscale,xnmid,vxmid,ynmid,vymid);
            fab_path_axis(v,xn);
            fab_path_axis(v,yn);
            if (v->path->dof > 2)
               fab_path_axis(v,zn);
            }
         clear_transform(&transform);
         }
      else if (strncmp(ptr,"<ellipse",8) == 0) {
         //
         // ellipse 
         //
         while (strncmp(ptr,"/>",2) != 0) ptr += 1; // read to end of element
         printf("   svg_path: ellipse not yet implemented\n");
         }
      else if (strncmp(ptr,"<line",5) == 0) {
         //
         // line
         //
         set_transform(ptr,&transform,transforms);
         set_intensity(ptr,&zn,v,zsign);
         start = 3+strstr(ptr,"x1=");
         next_number(&start,&x1);
         start = 3+strstr(ptr,"y1=");
         next_number(&start,&y1);
         start = 3+strstr(ptr,"x2=");
         next_number(&start,&x2);
         start = 3+strstr(ptr,"y2=");
         next_number(&start,&y2);
         while (strncmp(ptr,"/>",2) != 0) ptr += 1; // read to end of element
         //printf("   line: %f %f %f %f\n",x1,y1,x2,y2);
         fab_path_segment(v);
         fab_path_point(v);
         path_point(&xn,&yn,x1,y1,transform,transforms,xnscale,ynscale,xnmid,vxmid,ynmid,vymid);
         fab_path_axis(v,xn);
         fab_path_axis(v,yn);
         if (v->path->dof > 2)
            fab_path_axis(v,zn);
         fab_path_point(v);
         path_point(&xn,&yn,x2,y2,transform,transforms,xnscale,ynscale,xnmid,vxmid,ynmid,vymid);
         fab_path_axis(v,xn);
         fab_path_axis(v,yn);
         if (v->path->dof > 2)
            fab_path_axis(v,zn);
         clear_transform(&transform);
         }
      else if (strncmp(ptr,"<polyline",9) == 0) {
         //
         // polyline
         //
         set_transform(ptr,&transform,transforms);
         set_intensity(ptr,&zn,v,zsign);
         ptr = 8+strstr(ptr,"points=");
         //
         // move to first point
         //
         next_number(&ptr,&x);
         next_number(&ptr,&y);
         fab_path_segment(v);
         fab_path_point(v);
         path_point(&xn,&yn,x,y,transform,transforms,xnscale,ynscale,xnmid,vxmid,ynmid,vymid);
         fab_path_axis(v,xn);
         fab_path_axis(v,yn);
         if (v->path->dof > 2)
            fab_path_axis(v,zn);
         while (1) {
            //
            // loop over remaining points 
            //
            next_number(&ptr,&x);
            next_number(&ptr,&y);
            fab_path_point(v);
            path_point(&xn,&yn,x,y,transform,transforms,xnscale,ynscale,xnmid,vxmid,ynmid,vymid);
            fab_path_axis(v,xn);
            fab_path_axis(v,yn);
            if (v->path->dof > 2)
               fab_path_axis(v,zn);
            while ((*ptr == ' ') || (*ptr == '"') || (*ptr == 13) || (*ptr == 10)) ptr += 1; // skip space
            if (strncmp(ptr,"/>",2) == 0) break; // check for end
            }
         clear_transform(&transform);
         }
      else if (strncmp(ptr,"<polygon",8) == 0) {
         //
         // polygon
         //
         set_transform(ptr,&transform,transforms);
         set_intensity(ptr,&zn,v,zsign);
         ptr = 8+strstr(ptr,"points=");
         //
         // move to first point
         //
         next_number(&ptr,&x0);
         next_number(&ptr,&y0);
         fab_path_segment(v);
         fab_path_point(v);
         path_point(&xn,&yn,x0,y0,transform,transforms,xnscale,ynscale,xnmid,vxmid,ynmid,vymid);
         fab_path_axis(v,xn);
         fab_path_axis(v,yn);
         if (v->path->dof > 2)
            fab_path_axis(v,zn);
         while (1) {
            //
            // loop over remaining points 
            //
            next_number(&ptr,&x);
            next_number(&ptr,&y);
            fab_path_point(v);
            path_point(&xn,&yn,x,y,transform,transforms,xnscale,ynscale,xnmid,vxmid,ynmid,vymid);
            fab_path_axis(v,xn);
            fab_path_axis(v,yn);
            if (v->path->dof > 2)
               fab_path_axis(v,zn);
            while ((*ptr == ' ') || (*ptr == '"') || (*ptr == 13) || (*ptr == 10)) ptr += 1; // skip space
            if (strncmp(ptr,"/>",2) == 0) break; // check for end
            }
         fab_path_point(v);
         path_point(&xn,&yn,x0,y0,transform,transforms,xnscale,ynscale,xnmid,vxmid,ynmid,vymid);
         fab_path_axis(v,xn);
         fab_path_axis(v,yn);
         if (v->path->dof > 2)
            fab_path_axis(v,zn);
         clear_transform(&transform);
         }
      else if (strncmp(ptr,"<text",5) == 0) {
         //
         // text 
         //
         while (strncmp(ptr,"/text>",6) != 0) ptr += 1; // read to end of element
         printf("   svg_path: text not implemented\n");
         }
      } while ((endptr-ptr) > 1);
   }

int main(int argc, char **argv) {
   //
   // local vars
   //
   struct fab_vars v;
   init_vars(&v);
   int points,resolution;
   float scale,zmin,zmax;
   //
   // command line args
   // Largo al Factotum Canadian Brass
   //
   if ((argc != 3) && (argc != 4) && (argc != 5) && (argc != 6) && (argc != 7) && (argc != 8)) {
      printf("command line: svg_path in.svg out.path [scale [points [resolution [zmin [zmax]]]]]\n");
      printf("   in.svg = input binary SVG file\n");
      printf("   out.path = output path file\n");
      printf("   scale = scale factor (optional, default 1.0)\n");
      printf("   points = points per curve segment (optional, default 25)\n");
      printf("   resolution = path x resolution (optional, default 10000)\n");
      printf("   zmin = path min intensity z (optional, mm, default 0)\n");
      printf("   zmax = path max intensity z (optional, mm, default zmin)\n");
      exit(-1);
      }
   if (argc == 3) {
      scale = 1.0;
      points = 25;
      resolution = 10000;
      zmin = 0;
      zmax = 0;
      }
   else if (argc == 4) {
      sscanf(argv[3],"%f",&scale);
      points = 25;
      resolution = 10000;
      zmin = 0;
      zmax = 0;
      }
   else if (argc == 5) {
      sscanf(argv[3],"%f",&scale);
      sscanf(argv[4],"%d",&points);
      resolution = 10000;
      zmin = 0;
      zmax = 0;
      }
   else if (argc == 6) {
      sscanf(argv[3],"%f",&scale);
      sscanf(argv[4],"%d",&points);
      sscanf(argv[5],"%d",&resolution);
      zmin = 0;
      zmax = 0;
      }
   else if (argc == 7) {
      sscanf(argv[3],"%f",&scale);
      sscanf(argv[4],"%d",&points);
      sscanf(argv[5],"%d",&resolution);
      sscanf(argv[6],"%f",&zmin);
      zmax = zmin;
      }
   else if (argc == 8) {
      sscanf(argv[3],"%f",&scale);
      sscanf(argv[4],"%d",&points);
      sscanf(argv[5],"%d",&resolution);
      sscanf(argv[6],"%f",&zmin);
      sscanf(argv[7],"%f",&zmax);
      }
   //
   //  read SVG
   //
   if (argc <= 6)
      fab_path_start(&v,2);
   else
      fab_path_start(&v,3);
   fab_read_svg(&v,argv[1],scale,points,resolution,zmin,zmax);
   //
   // write path
   //
   fab_write_path(&v,argv[2]);
   //
   // return
   //
   return(0);
   }
*/
