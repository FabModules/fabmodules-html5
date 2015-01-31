//
// mod_ui.js
//   fab module UI routines
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
// todo
//    SVG path in
//    window.URL.revokeObjectURL blob download
//    .vol surface definition algorithms
//    .vol region selection
//    .vol decimation
//    check wget, mod_serve path
//    nodejs-legacy
//    DXF out
//    switch from dataview to array views
//    .gif in
//    handle corner states
//    job time estimates
//    faster z offset search
//    tool collision check
//    laser vector height power
//    Roland mill multiple machines
//    remove GL buffer ends
//    re-get window width on file load
//    file input type restriction
//

define(['mods/mod_globals', 'mods/mod_file'], function(globals, mod_file) {

   var exports = {};

   //
   // defines
   //

   var Defaults = {
      background_color: "#dddddd",
      highlight_background_color: "#bbbbbb",
      text_color: "#000000",
      disable_text_color: "#888888",
      margin: 10,
      width: window.innerWidth,
      height: window.innerHeight,
   }


   var findEl = globals.findEl;



   exports.defaults = Defaults;




   exports.initGUI = function() {
      //
      // set up UI elements
      //
      var span = findEl("mod_prompt")
      span.innerHTML = "<a href='mods.html'>fab modules</a>"
      span.setAttribute("style", "display:block;position:absolute;top:" + Defaults.margin + ";left:" + (1.5 * Defaults.margin + span.offsetHeight))
      globals.mod_menu_width = 2.2 * span.offsetWidth
      globals.mod_menu_height = span.offsetHeight
      //
      var span = findEl("mod_logo")
      span.setAttribute("style", "display:block;position:absolute;top:" + Defaults.margin + ";left:" + Defaults.margin + ";width:" + globals.mod_menu_height + ";height:" + globals.mod_menu_height)
      span.appendChild(ui_CBA(globals.mod_menu_width))
      //
      var div = findEl("mod_inputs")
      div.setAttribute("style", "position:absolute;top:" + (1.5 * Defaults.margin + globals.mod_menu_height) + ";left:" + Defaults.margin)
      //
      var span = findEl("mod_inputs_label")
      //span.setAttribute("style","text-align:center;vertical-align:middle;display:table-cell;width:"+globals.mod_menu_width+";height:"+2*globals.mod_menu_height)
      span.setAttribute("style", "text-align:center;display:block;width:" + globals.mod_menu_width + ";height:" + 1.5 * globals.mod_menu_height)
      span.style.background = Defaults.background_color
      span.style.color = Defaults.text_color
      //
      var div = findEl("mod_outputs")
      div.setAttribute("style", "position:absolute;top:" + (1.5 * Defaults.margin + globals.mod_menu_height) + ";left:" + (Defaults.margin + globals.mod_menu_width))
      //
      var span = findEl("mod_outputs_label")
      span.setAttribute("style", "text-align:center;display:none;width:" + globals.mod_menu_width + ";height:" + 1.5 * globals.mod_menu_height)
      span.style.background = Defaults.background_color
      span.style.color = Defaults.text_color
      //
      var div = findEl("mod_processes")
      div.setAttribute("style", "position:absolute;top:" + (1.5 * Defaults.margin + globals.mod_menu_height) + ";left:" + (Defaults.margin + 2 * globals.mod_menu_width))
      //
      var span = findEl("mod_processes_label")
      span.setAttribute("style", "text-align:center;display:none;width:" + globals.mod_menu_width + ";height:" + 1.5 * globals.mod_menu_height)
      span.style.background = Defaults.background_color
      span.style.color = Defaults.text_color
      //
      var div = findEl("mod_display")
      div.setAttribute("style", "position:absolute;top:" + (2.5 * Defaults.margin + 2 * globals.mod_menu_height) + ";left:" + Defaults.margin + ";width:" + (Defaults.width * .75 - Defaults.margin) + ";height:" + Defaults.height)
      //
      var canvas = findEl("mod_input_canvas")
      canvas.style.width = "100%"
      //
      var canvas = findEl("mod_process_canvas")
      canvas.style.width = "100%"
      //
      var canvas = findEl("mod_output_canvas")
      canvas.style.width = "100%"
      //
      var canvas = findEl("mod_gl_canvas")
      canvas.style.width = "100%"
      //
      var div = findEl("mod_controls")
      div.setAttribute("style", "position:absolute;top:" + (2.5 * Defaults.margin + 2 * globals.mod_menu_height) + ";left:" + (Defaults.width * .75 + Defaults.margin) + ";width:" + (Defaults.width * .25 - Defaults.margin))

   }
   //
   // mod_add_process
   //    add a process
   //

   exports.add_process = function add_process(arr) {
      var index = arr.map(function(el) {
         return el[0]
      }).indexOf("name")
      var modname = arr[index][1]
      index = arr.map(function(el) {
         return el[0]
      }).indexOf("controls")
      var controls = arr[index][1]
      index = arr.map(function(el) {
         return el[0]
      }).indexOf("routine")
      var routine = arr[index][1]
      index = arr.map(function(el){
         return el[0]
      }).indexOf("module")
      var module = arr[index][1]
       
      var fn_name = "mod_"
      for (var i = 0; i < modname.length; ++i)
         fn_name += modname.charCodeAt(i)
         // var fn_str = controls + "(\"" + routine + "\");"
      var fn_str = " require(['processes/mod_path'], function(mod_path){"
         
      fn_str += "mod_path.controls." + controls + "(\"" + routine + "\",\"" + module + "\");"
      for (var i = 0; i < arr.length; ++i) {
         fn_str += "var element = findEl(\"mod_" + arr[i][0] + "\");"
         fn_str += "if (element != null) element.setAttribute(\"value\",\"" + arr[i][1] + "\");"
      }
      fn_str += "});"
      window[fn_name] = Function(fn_str)
      index = arr.map(function(el) {
         return el[0]
      }).indexOf("module")
      var mod = arr[index][1]
      globals.processes[fn_name + mod] = {
         func: fn_name,
         name: modname,
         module: mod
      }
   }

   //
   // mod_edit_process
   //    edit a process
   //
   exports.edit_process = function(arr) {
      var index = arr.map(function(el) {
         return el[0]
      }).indexOf("name")
      var modname = arr[index][1]
      var fn_name = "edit_mod_"
      for (var i = 0; i < modname.length; ++i)
         fn_name += modname.charCodeAt(i)
      var fn_str = "require(['processes/mod_path'], function(mod_path){"
      for (var i = 0; i < arr.length; ++i) {
         fn_str += "var element = findEl(\"mod_" + arr[i][0] + "\");"
         fn_str += "if (element != null) element.setAttribute(\"value\",\"" + arr[i][1] + "\");"
      }
      fn_str += "});"
      window[fn_name] = Function(fn_str)
      index = arr.map(function(el) {
         return el[0]
      }).indexOf("module")
      var mod = arr[index][1]
      globals.process_edits[fn_name + mod] = {
         func: fn_name,
         name: modname,
         module: mod
      }
   }
   //
   // mod_ui_CBA
   //    add CBA logo
   //
   var ui_CBA = function(size) {
      var x = 0
      var y = 2.8 * size / 3.8
      var svgNS = "http://www.w3.org/2000/svg"
      var logo = document.createElementNS(svgNS, "svg")
      logo.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink")
      logo.setAttributeNS(null, 'viewBox', "0 0 " + size + " " + size)
      var new_rect = document.createElementNS(svgNS, "rect");
      new_rect.setAttribute("width", size / 3.8)
      new_rect.setAttribute("height", size / 3.8)
      new_rect.setAttribute("x", x)
      new_rect.setAttribute("y", y)
      new_rect.setAttribute("fill", "blue")
      logo.appendChild(new_rect)
      var new_rect = document.createElementNS(svgNS, "rect");
      new_rect.setAttribute("width", size / 3.8)
      new_rect.setAttribute("height", size / 3.8)
      new_rect.setAttribute("x", x + 1.4 * size / 3.8)
      new_rect.setAttribute("y", y)
      new_rect.setAttribute("fill", "blue")
      logo.appendChild(new_rect)
      var new_rect = document.createElementNS(svgNS, "rect");
      new_rect.setAttribute("width", size / 3.8)
      new_rect.setAttribute("height", size / 3.8)
      new_rect.setAttribute("x", x + 2.8 * size / 3.8)
      new_rect.setAttribute("y", y)
      new_rect.setAttribute("fill", "blue")
      logo.appendChild(new_rect)
      var new_rect = document.createElementNS(svgNS, "rect");
      new_rect.setAttribute("width", size / 3.8)
      new_rect.setAttribute("height", size / 3.8)
      new_rect.setAttribute("x", x)
      new_rect.setAttribute("y", y - 1.4 * size / 3.8)
      new_rect.setAttribute("fill", "blue")
      logo.appendChild(new_rect)
      var new_rect = document.createElementNS(svgNS, "rect");
      new_rect.setAttribute("width", size / 3.8)
      new_rect.setAttribute("height", size / 3.8)
      new_rect.setAttribute("x", x + 2.8 * size / 3.8)
      new_rect.setAttribute("y", y - 1.4 * size / 3.8)
      new_rect.setAttribute("fill", "blue")
      logo.appendChild(new_rect)
      var new_rect = document.createElementNS(svgNS, "rect");
      new_rect.setAttribute("width", size / 3.8)
      new_rect.setAttribute("height", size / 3.8)
      new_rect.setAttribute("x", x + 1.4 * size / 3.8)
      new_rect.setAttribute("y", y - 2.8 * size / 3.8)
      new_rect.setAttribute("fill", "blue")
      logo.appendChild(new_rect)
      var new_rect = document.createElementNS(svgNS, "rect");
      new_rect.setAttribute("width", size / 3.8)
      new_rect.setAttribute("height", size / 3.8)
      new_rect.setAttribute("x", x + 2.8 * size / 3.8)
      new_rect.setAttribute("y", y - 2.8 * size / 3.8)
      new_rect.setAttribute("fill", "blue")
      logo.appendChild(new_rect)
      var new_circ = document.createElementNS(svgNS, "circle");
      new_circ.setAttribute("r", size / (2 * 3.8))
      new_circ.setAttribute("cx", x + size / (2 * 3.8))
      new_circ.setAttribute("cy", y + size / (2 * 3.8) - 2.8 * size / 3.8)
      new_circ.setAttribute("fill", "red")
      logo.appendChild(new_circ)
      var new_circ = document.createElementNS(svgNS, "circle");
      new_circ.setAttribute("r", size / (2 * 3.8))
      new_circ.setAttribute("cx", x + size / (2 * 3.8) + 1.4 * size / 3.8)
      new_circ.setAttribute("cy", y + size / (2 * 3.8) - 1.4 * size / 3.8)
      new_circ.setAttribute("fill", "red")
      logo.appendChild(new_circ)
      return logo
   }
   //
   // mod_ui_clear
   //    clear displays
   //
   exports.ui_clear = function() {
      exports.ui_prompt("")
      var display = findEl("mod_display")
      if (display.contains(findEl("mod_display_path")))
         display.removeChild(findEl("mod_display_path"))
      var input_canvas = findEl("mod_input_canvas")
      input_canvas.style.display = "none"
      var process_canvas = findEl("mod_process_canvas")
      process_canvas.style.display = "none"
      var output_canvas = findEl("mod_output_canvas")
      output_canvas.style.display = "none"
      var output_canvas = findEl("mod_gl_canvas")
      output_canvas.style.display = "none"
   }


   //
   // mod_ui_menu_action_item
   //    add action menu item
   //
   var ui_menu_action_item = function(item, menu, label) {
      var span = document.createElement("span")
      if (item[1] != "") {
         span.setAttribute("style", "text-align:center;width:" + globals.mod_menu_width + ";height:" + globals.mod_menu_height + ";background:" + Defaults.background_color + ";color:" + Defaults.text_color + ";display:block")
         span.innerHTML = item[0] + "<br>"
         span.addEventListener("mouseout", function(e) {
            this.style.background = Defaults.background_color
         }, false)
         span.addEventListener("mouseover", function(e) {
            this.style.background = Defaults.highlight_background_color
         }, false)
         span.addEventListener("click", function(e) {
            if (menu.hasChildNodes()) {
               menu.innerHTML = ""
            }
            label.innerHTML = item[0]
            exports.ui_prompt("")
            mod_file.call(item[1])
         }, false)
      } else {
         span.setAttribute("style", "text-align:center;width:" + globals.mod_menu_width + ";height:" + globals.mod_menu_height + ";background:" + Defaults.background_color + ";color:" + Defaults.disable_text_color + ";display:block")
         span.innerHTML = item[0] + "<br>"
         span.addEventListener("mouseout", function(e) {
            this.style.background = Defaults.background_color
         }, false)
         span.addEventListener("mouseover", function(e) {
            this.style.background = Defaults.highlight_background_color
         }, false)
      }
      menu.appendChild(span)
   }


   //
   // mod_ui_menu_action
   //   build action menu
   //
   exports.ui_menu_action = function(items, name) {
      var menu = findEl(name + "_menu")
      var label = findEl(name + "_label")
      if (menu.hasChildNodes()) {
         menu.innerHTML = ""
         return
      }
      for (var i = 0; i < items.length; ++i) {
         ui_menu_action_item(items[i], menu, label)
      }
   }


   //
   // mod_ui_menu_eval_item
   //    add eval menu item
   //
   var ui_menu_eval_item = function(item, name) {
      var menu = findEl(name + "_menu")
      var label = findEl(name + "_label")
      var span = document.createElement("span")
      if (item[1] != "") {
         span.setAttribute("style", "text-align:center;width:" + globals.mod_menu_width + ";height:" + globals.mod_menu_height + ";background:" + Defaults.background_color + ";color:" + Defaults.text_color + ";display:block")
         span.innerHTML = item[0] + "<br>"
         span.addEventListener("mouseout", function(e) {
            this.style.background = Defaults.background_color
         }, false)
         span.addEventListener("mouseover", function(e) {
            this.style.background = Defaults.highlight_background_color
         }, false)
         span.addEventListener("click", function(e) {
            if (menu.hasChildNodes()) {
               menu.innerHTML = ""
            }
            label.innerHTML = item[0]
            exports.ui_prompt("")
            globals.myeval(item[1])
         }, false)
      } else {
         span.setAttribute("style", "text-align:center;width:" + globals.mod_menu_width + ";height:" + globals.mod_menu_height + ";background:" + Defaults.background_color + ";color:" + Defaults.disable_text_color + ";display:block")
         span.innerHTML = item[0] + "<br>"
         span.addEventListener("mouseout", function(e) {
            this.style.background = Defaults.background_color
         }, false)
         span.addEventListener("mouseover", function(e) {
            this.style.background = Defaults.highlight_background_color
         }, false)
      }
      menu.appendChild(span)
   }

   //
   // mod_ui_menu_eval
   //   build eval menu
   //
   exports.ui_menu_eval = function(items, name) {
      var menu = findEl(name + "_menu")
      if (menu.hasChildNodes()) {
         menu.innerHTML = ""
         return
      }
      for (var i = 0; i < items.length; ++i) {
         ui_menu_eval_item(items[i], name)
      }
      globals.myeval(globals.settings)
   }



   //
   // mod_ui_menu_file_item
   //    add file menu item
   //
   var ui_menu_file_item = function(item, menu, label) {
      var span = document.createElement("span")
      if (item[1] != "") {
         span.setAttribute("style", "text-align:center;width:" + globals.mod_menu_width + ";height:" + globals.mod_menu_height + ";background:" + Defaults.background_color + ";color:" + Defaults.text_color + ";display:block")
         span.innerHTML = item[0] + "<br>"
         span.addEventListener("mouseout", function(e) {
            this.style.background = Defaults.background_color
         }, false)
         span.addEventListener("mouseover", function(e) {
            this.style.background = Defaults.highlight_background_color
         }, false)
         span.addEventListener("click", function(e) {
            if (menu.hasChildNodes()) {
               menu.innerHTML = ""
            }
            label.innerHTML = item[0]
            exports.ui_prompt("")
            mod_file.call(item[1])
            var file = findEl("mod_file_input")
            file.click()
         }, false)
      } else {
         span.setAttribute("style", "text-align:center;width:" + globals.mod_menu_width + ";height:" + globals.mod_menu_height + ";background:" + Defaults.background_color + ";color:" + Defaults.disable_text_color + ";display:block")
         span.innerHTML = item[0] + "<br>"
         span.addEventListener("mouseout", function(e) {
            this.style.background = Defaults.background_color
         }, false)
         span.addEventListener("mouseover", function(e) {
            this.style.background = Defaults.highlight_background_color
         }, false)
      }
      menu.appendChild(span)
   }

   //
   // mod_ui_menu_file
   //   build file menu
   //
   exports.ui_menu_file = function(items, name) {
      var menu = findEl(name + "_menu")
      var label = findEl(name + "_label")
      if (menu.hasChildNodes()) {
         menu.innerHTML = ""
         return
      }
      for (var i = 0; i < items.length; ++i) {
         ui_menu_file_item(items[i], menu, label)
      }
   }


   //
   // mod_ui_menu_process_item
   //    add process menu item
   //
   var ui_menu_process_item = function(item, name) {
      var menu = findEl(name + "_menu")
      var label = findEl(name + "_label")
      var span = document.createElement("span")
      if (item[1] != "") {
         span.setAttribute("style", "text-align:center;width:" + globals.mod_menu_width + ";height:" + globals.mod_menu_height + ";background:" + Defaults.background_color + ";color:" + Defaults.text_color + ";display:block")
         span.innerHTML = item[0] + "<br>"
         span.addEventListener("mouseout", function(e) {
            this.style.background = Defaults.background_color
         }, false)
         span.addEventListener("mouseover", function(e) {
            this.style.background = Defaults.highlight_background_color
         }, false)
         span.addEventListener("click", function(e) {
            if (menu.hasChildNodes()) {
               menu.innerHTML = ""
            }
            label.innerHTML = item[0]
            exports.ui_prompt("")
            globals.myeval(item[1])
            var key = "edit_" + item[1].slice(0, -2) + globals.output
            if (globals.process_edits[key] != undefined)
               globals.myeval(globals.process_edits[key].func + "()")
         }, false)
      } else {
         span.setAttribute("style", "text-align:center;width:" + globals.mod_menu_width + ";height:" + globals.mod_menu_height + ";background:" + Defaults.background_color + ";color:" + Defaults.disable_text_color + ";display:block")
         span.innerHTML = item[0] + "<br>"
         span.addEventListener("mouseout", function(e) {
            this.style.background = Defaults.background_color
         }, false)
         span.addEventListener("mouseover", function(e) {
            this.style.background = Defaults.highlight_background_color
         }, false)
      }
      menu.appendChild(span)
   }
   //
   // mod_ui_menu_process
   //    build process menu
   //
   exports.ui_menu_process = function() {
      var menu = findEl("mod_processes_menu")
      if (menu.hasChildNodes()) {
         menu.innerHTML = ""
         return
      }
      for (var item in globals.processes) {
         //console.log(item);
         var fn = globals.processes[item].func + "()"
         var mod = globals.processes[item].module
         var modname = globals.processes[item].name
         //console.log(modname + ' ' + fn);
         if (mod == globals.output)
            ui_menu_process_item([modname, fn], "mod_processes")
      }
   }

   //
   // exports.ui_prompt
   //    change prompt message
   //
   exports.ui_prompt = function(m) {
      if (m != "")
         findEl("mod_prompt").innerHTML = m
      else
         findEl("mod_prompt").innerHTML =
            "<a href='mods.html'>fab modules</a>"
   }
   //
   // mod_ui_show_input
   //    show input
   //
   exports.ui_show_input = function() {
      var input_canvas = findEl("mod_input_canvas")
      input_canvas.style.display = "inline"
   }
   //
   // mod_ui_view_reset
   //    reset view
   exports.ui_view_reset = function() {
      globals.dx = ""
      globals.dy = ""
      globals.dz = ""
      globals.rx = ""
      globals.ry = ""
      globals.rz = ""
      globals.s = ""
   }

   return exports;
});
