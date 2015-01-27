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

//
// defines
//
var background_color = "#dddddd"
var highlight_background_color = "#bbbbbb"
var text_color = "#000000"
var disable_text_color = "#888888"
var margin = 10
var width = window.innerWidth
var height = window.innerHeight
//
// globals
//
document.mod = {}
document.mod.input = "" // current input module
document.mod.output = "" // current output module
document.mod.settings = "" // settings
document.mod.xmin = "" // last xmin
document.mod.ymin = "" // last ymin
document.mod.zmin = "" // last zmin
document.mod.server = '127.0.0.1:12345' // machine server
document.mod.type = "" // file type extension
document.mod.processes = {} // processes
document.mod.process_edits = {} // process edits
document.mod.dx = "" // view dx
document.mod.dy = "" // view dy
document.mod.dz = "" // view dz
document.mod.rx = "" // view rx
document.mod.ry = "" // view ry
document.mod.rz = "" // view rz
document.mod.s = "" // view scale
document.mod.mesh = {} // mesh data
document.mod.vol = {} // volume data
//
// set up UI elements
//
var span = document.getElementById("mod_prompt")
span.innerHTML ="<a href='mods.html'>fab modules</a>"
span.setAttribute("style","display:block;position:absolute;top:"+margin+";left:"+(1.5*margin+span.offsetHeight))
window.mod_menu_width = 2.2*span.offsetWidth
window.mod_menu_height = span.offsetHeight
//
var span = document.getElementById("mod_logo")
span.setAttribute("style","display:block;position:absolute;top:"+margin+";left:"+margin+";width:"+mod_menu_height+";height:"+mod_menu_height)
span.appendChild(mod_ui_CBA(window.mod_menu_width))
//
var div = document.getElementById("mod_inputs")
div.setAttribute("style","position:absolute;top:"+(1.5*margin+window.mod_menu_height)+";left:"+margin)
//
var span = document.getElementById("mod_inputs_label")
//span.setAttribute("style","text-align:center;vertical-align:middle;display:table-cell;width:"+window.mod_menu_width+";height:"+2*window.mod_menu_height)
span.setAttribute("style","text-align:center;display:block;width:"+window.mod_menu_width+";height:"+1.5*window.mod_menu_height)
span.style.background = background_color
span.style.color = text_color
//
var div = document.getElementById("mod_outputs")
div.setAttribute("style","position:absolute;top:"+(1.5*margin+window.mod_menu_height)+";left:"+(margin+window.mod_menu_width))
//
var span = document.getElementById("mod_outputs_label")
span.setAttribute("style","text-align:center;display:none;width:"+window.mod_menu_width+";height:"+1.5*window.mod_menu_height)
span.style.background = background_color
span.style.color = text_color
//
var div = document.getElementById("mod_processes")
div.setAttribute("style","position:absolute;top:"+(1.5*margin+window.mod_menu_height)+";left:"+(margin+2*window.mod_menu_width))
//
var span = document.getElementById("mod_processes_label")
span.setAttribute("style","text-align:center;display:none;width:"+window.mod_menu_width+";height:"+1.5*window.mod_menu_height)
span.style.background = background_color
span.style.color = text_color
//
var div = document.getElementById("mod_display")
div.setAttribute("style","position:absolute;top:"+(2.5*margin+2*window.mod_menu_height)+";left:"+margin+";width:"+(width*.75-margin)+";height:"+height)
//
var canvas = document.getElementById("mod_input_canvas")
canvas.style.width = "100%"
//
var canvas = document.getElementById("mod_process_canvas")
canvas.style.width = "100%"
//
var canvas = document.getElementById("mod_output_canvas")
canvas.style.width = "100%"
//
var canvas = document.getElementById("mod_gl_canvas")
canvas.style.width = "100%"
//
var div = document.getElementById("mod_controls")
div.setAttribute("style","position:absolute;top:"+(2.5*margin+2*window.mod_menu_height)+";left:"+(width*.75+margin)+";width:"+(width*.25-margin))
//
// mod_add_process
//    add a process
//
function mod_add_process(arr) {
   var index = arr.map(function(el){return el[0]}).indexOf("name")
   var modname = arr[index][1]
   index = arr.map(function(el){return el[0]}).indexOf("controls")
   controls = arr[index][1]
   index = arr.map(function(el){return el[0]}).indexOf("routine")
   routine = arr[index][1]
   var fn_name = "mod_"
   for (var i = 0; i < modname.length; ++i)
      fn_name += modname.charCodeAt(i)
   var fn_str = controls+"(\""+routine+"\");"
   for (var i = 0; i < arr.length; ++i) {
      fn_str += "var element = document.getElementById(\"mod_"+arr[i][0]+"\");"
      fn_str += "if (element != null) element.setAttribute(\"value\",\""+arr[i][1]+"\");"
      }
   window[fn_name] = Function(fn_str)
   index = arr.map(function(el){return el[0]}).indexOf("module")
   var mod = arr[index][1]
   document.mod.processes[fn_name+mod] = {func:fn_name, name:modname, module:mod}
   }
//
// mod_edit_process
//    edit a process
//
function mod_edit_process(arr) {
   var index = arr.map(function(el){return el[0]}).indexOf("name")
   var modname = arr[index][1]
   var fn_name = "edit_mod_"
   for (var i = 0; i < modname.length; ++i)
      fn_name += modname.charCodeAt(i)
   var fn_str = ""
   for (var i = 0; i < arr.length; ++i) {
      fn_str += "var element = document.getElementById(\"mod_"+arr[i][0]+"\");"
      fn_str += "if (element != null) element.setAttribute(\"value\",\""+arr[i][1]+"\");"
      }
   window[fn_name] = Function(fn_str)
   index = arr.map(function(el){return el[0]}).indexOf("module")
   var mod = arr[index][1]
   document.mod.process_edits[fn_name+mod] = {func:fn_name, name:modname, module:mod}
   }
//
// mod_ui_CBA
//    add CBA logo
//
function mod_ui_CBA(size) {
   var x = 0
   var y = 2.8*size/3.8
   var svgNS = "http://www.w3.org/2000/svg"
   var logo = document.createElementNS(svgNS, "svg")
   logo.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink")
   logo.setAttributeNS(null,'viewBox',"0 0 "+size+" "+size)
   var new_rect = document.createElementNS(svgNS,"rect");
      new_rect.setAttribute("width",size/3.8)
      new_rect.setAttribute("height",size/3.8)
      new_rect.setAttribute("x",x)
      new_rect.setAttribute("y",y)
      new_rect.setAttribute("fill","blue")
   logo.appendChild(new_rect)
   var new_rect = document.createElementNS(svgNS,"rect");
      new_rect.setAttribute("width",size/3.8)
      new_rect.setAttribute("height",size/3.8)
      new_rect.setAttribute("x",x+1.4*size/3.8)
      new_rect.setAttribute("y",y)
      new_rect.setAttribute("fill","blue")
   logo.appendChild(new_rect)
   var new_rect = document.createElementNS(svgNS,"rect");
      new_rect.setAttribute("width",size/3.8)
      new_rect.setAttribute("height",size/3.8)
      new_rect.setAttribute("x",x+2.8*size/3.8)
      new_rect.setAttribute("y",y)
      new_rect.setAttribute("fill","blue")
   logo.appendChild(new_rect)
   var new_rect = document.createElementNS(svgNS,"rect");
      new_rect.setAttribute("width",size/3.8)
      new_rect.setAttribute("height",size/3.8)
      new_rect.setAttribute("x",x)
      new_rect.setAttribute("y",y-1.4*size/3.8)
      new_rect.setAttribute("fill","blue")
   logo.appendChild(new_rect)
   var new_rect = document.createElementNS(svgNS,"rect");
      new_rect.setAttribute("width",size/3.8)
      new_rect.setAttribute("height",size/3.8)
      new_rect.setAttribute("x",x+2.8*size/3.8)
      new_rect.setAttribute("y",y-1.4*size/3.8)
      new_rect.setAttribute("fill","blue")
   logo.appendChild(new_rect)
   var new_rect = document.createElementNS(svgNS,"rect");
      new_rect.setAttribute("width",size/3.8)
      new_rect.setAttribute("height",size/3.8)
      new_rect.setAttribute("x",x+1.4*size/3.8)
      new_rect.setAttribute("y",y-2.8*size/3.8)
      new_rect.setAttribute("fill","blue")
   logo.appendChild(new_rect)
   var new_rect = document.createElementNS(svgNS,"rect");
      new_rect.setAttribute("width",size/3.8)
      new_rect.setAttribute("height",size/3.8)
      new_rect.setAttribute("x",x+2.8*size/3.8)
      new_rect.setAttribute("y",y-2.8*size/3.8)
      new_rect.setAttribute("fill","blue")
   logo.appendChild(new_rect)
   var new_circ = document.createElementNS(svgNS,"circle");
      new_circ.setAttribute("r",size/(2*3.8))
      new_circ.setAttribute("cx",x+size/(2*3.8))
      new_circ.setAttribute("cy",y+size/(2*3.8)-2.8*size/3.8)
      new_circ.setAttribute("fill","red")
   logo.appendChild(new_circ)
   var new_circ = document.createElementNS(svgNS,"circle");
      new_circ.setAttribute("r",size/(2*3.8))
      new_circ.setAttribute("cx",x+size/(2*3.8)+1.4*size/3.8)
      new_circ.setAttribute("cy",y+size/(2*3.8)-1.4*size/3.8)
      new_circ.setAttribute("fill","red")
   logo.appendChild(new_circ)
   return logo
   }
//
// mod_ui_clear
//    clear displays
//
function mod_ui_clear() {
   mod_ui_prompt("")
   var display = document.getElementById("mod_display")
   if (display.contains(document.getElementById("mod_display_path")))
      display.removeChild(document.getElementById("mod_display_path"))
   var input_canvas = document.getElementById("mod_input_canvas")
   input_canvas.style.display = "none"
   var process_canvas = document.getElementById("mod_process_canvas")
   process_canvas.style.display = "none"
   var output_canvas = document.getElementById("mod_output_canvas")
   output_canvas.style.display = "none"
   var output_canvas = document.getElementById("mod_gl_canvas")
   output_canvas.style.display = "none"
   }
//
// mod_ui_menu_action
//   build action menu
//
function mod_ui_menu_action(items,name) {
   var menu = document.getElementById(name+"_menu")
   var label = document.getElementById(name+"_label")
   if (menu.hasChildNodes()) {
      menu.innerHTML = ""
      return
      }
   for (var i = 0; i < items.length; ++i) {
      mod_ui_menu_action_item(items[i],menu,label)
      }
   }
//
// mod_ui_menu_action_item
//    add action menu item
//
function mod_ui_menu_action_item(item,menu,label) {
   var span = document.createElement("span")
   if (item[1] != "") {
      span.setAttribute("style","text-align:center;width:"+window.mod_menu_width+";height:"+window.mod_menu_height+";background:"+background_color+";color:"+text_color+";display:block")
      span.innerHTML = item[0]+"<br>"
      span.addEventListener("mouseout", function (e) {
         this.style.background = background_color
         }, false)
      span.addEventListener("mouseover", function (e) {
         this.style.background = highlight_background_color
         }, false)
      span.addEventListener("click", function (e) {
         if (menu.hasChildNodes()) {
            menu.innerHTML = ""
            }
         label.innerHTML = item[0]
         mod_ui_prompt("")
         mod_file_call(item[1])
         }, false)
      } else {
      span.setAttribute("style","text-align:center;width:"+window.mod_menu_width+";height:"+window.mod_menu_height+";background:"+background_color+";color:"+disable_text_color+";display:block")
      span.innerHTML = item[0]+"<br>"
      span.addEventListener("mouseout", function (e) {
         this.style.background = background_color
         }, false)
      span.addEventListener("mouseover", function (e) {
         this.style.background = highlight_background_color
         }, false)
      }
   menu.appendChild(span)
   }
//
// mod_ui_menu_eval
//   build eval menu
//
function mod_ui_menu_eval(items,name) {
   var menu = document.getElementById(name+"_menu")
   if (menu.hasChildNodes()) {
      menu.innerHTML = ""
      return
      }
   for (var i = 0; i < items.length; ++i) {
      mod_ui_menu_eval_item(items[i],name)
      }
   eval(document.mod.settings)
   }
//
// mod_ui_menu_eval_item
//    add eval menu item
//
function mod_ui_menu_eval_item(item,name) {
   var menu = document.getElementById(name+"_menu")
   var label = document.getElementById(name+"_label")
   var span = document.createElement("span")
   if (item[1] != "") {
      span.setAttribute("style","text-align:center;width:"+window.mod_menu_width+";height:"+window.mod_menu_height+";background:"+background_color+";color:"+text_color+";display:block")
      span.innerHTML = item[0]+"<br>"
      span.addEventListener("mouseout", function (e) {
         this.style.background = background_color
         }, false)
      span.addEventListener("mouseover", function (e) {
         this.style.background = highlight_background_color
         }, false)
      span.addEventListener("click", function (e) {
         if (menu.hasChildNodes()) {
            menu.innerHTML = ""
            }
         label.innerHTML = item[0]
         mod_ui_prompt("")
         eval(item[1])
         }, false)
      } else {
      span.setAttribute("style","text-align:center;width:"+window.mod_menu_width+";height:"+window.mod_menu_height+";background:"+background_color+";color:"+disable_text_color+";display:block")
      span.innerHTML = item[0]+"<br>"
      span.addEventListener("mouseout", function (e) {
         this.style.background = background_color
         }, false)
      span.addEventListener("mouseover", function (e) {
         this.style.background = highlight_background_color
         }, false)
      }
   menu.appendChild(span)
   }
//
// mod_ui_menu_file
//   build file menu
//
function mod_ui_menu_file(items,name) {
   var menu = document.getElementById(name+"_menu")
   var label = document.getElementById(name+"_label")
   if (menu.hasChildNodes()) {
      menu.innerHTML = ""
      return
      }
   for (var i = 0; i < items.length; ++i) {
      mod_ui_menu_file_item(items[i],menu,label)
      }
   }
//
// mod_ui_menu_file_item
//    add file menu item
//
function mod_ui_menu_file_item(item,menu,label) {
   var span = document.createElement("span")
   if (item[1] != "") {
      span.setAttribute("style","text-align:center;width:"+window.mod_menu_width+";height:"+window.mod_menu_height+";background:"+background_color+";color:"+text_color+";display:block")
      span.innerHTML = item[0]+"<br>"
      span.addEventListener("mouseout", function (e) {
         this.style.background = background_color
         }, false)
      span.addEventListener("mouseover", function (e) {
         this.style.background = highlight_background_color
         }, false)
      span.addEventListener("click", function (e) {
         if (menu.hasChildNodes()) {
            menu.innerHTML = ""
            }
         label.innerHTML = item[0]
         mod_ui_prompt("")
         mod_file_call(item[1])
         var file = document.getElementById("mod_file_input")
         file.click()
         }, false)
      } else {
      span.setAttribute("style","text-align:center;width:"+window.mod_menu_width+";height:"+window.mod_menu_height+";background:"+background_color+";color:"+disable_text_color+";display:block")
      span.innerHTML = item[0]+"<br>"
      span.addEventListener("mouseout", function (e) {
         this.style.background = background_color
         }, false)
      span.addEventListener("mouseover", function (e) {
         this.style.background = highlight_background_color
         }, false)
      }
   menu.appendChild(span)
   }
//
// mod_ui_menu_process
//    build process menu
//
function mod_ui_menu_process() {
   var menu = document.getElementById("mod_processes_menu")
   if (menu.hasChildNodes()) {
      menu.innerHTML = ""
      return
      }
   for (var item in document.mod.processes) {
      var fn = document.mod.processes[item].func+"()"
      var mod = document.mod.processes[item].module
      var modname = document.mod.processes[item].name
      if (mod == document.mod.output)
         mod_ui_menu_process_item([modname,fn],"mod_processes")
      }
   }
//
// mod_ui_menu_process_item
//    add process menu item
//
function mod_ui_menu_process_item(item,name) {
   var menu = document.getElementById(name+"_menu")
   var label = document.getElementById(name+"_label")
   var span = document.createElement("span")
   if (item[1] != "") {
      span.setAttribute("style","text-align:center;width:"+window.mod_menu_width+";height:"+window.mod_menu_height+";background:"+background_color+";color:"+text_color+";display:block")
      span.innerHTML = item[0]+"<br>"
      span.addEventListener("mouseout", function (e) {
         this.style.background = background_color
         }, false)
      span.addEventListener("mouseover", function (e) {
         this.style.background = highlight_background_color
         }, false)
      span.addEventListener("click", function (e) {
         if (menu.hasChildNodes()) {
            menu.innerHTML = ""
            }
         label.innerHTML = item[0]
         mod_ui_prompt("")
         eval(item[1])
         var key = "edit_"+item[1].slice(0,-2)+document.mod.output
         if (document.mod.process_edits[key] != undefined)
            eval(document.mod.process_edits[key].func+"()")
         }, false)
      } else {
      span.setAttribute("style","text-align:center;width:"+window.mod_menu_width+";height:"+window.mod_menu_height+";background:"+background_color+";color:"+disable_text_color+";display:block")
      span.innerHTML = item[0]+"<br>"
      span.addEventListener("mouseout", function (e) {
         this.style.background = background_color
         }, false)
      span.addEventListener("mouseover", function (e) {
         this.style.background = highlight_background_color
         }, false)
      }
   menu.appendChild(span)
   }
//
// mod_ui_prompt
//    change prompt message
//
function mod_ui_prompt(m) {
   if (m != "")
      document.getElementById("mod_prompt").innerHTML = m
   else
      document.getElementById("mod_prompt").innerHTML =
         "<a href='mods.html'>fab modules</a>"
   }
//
// mod_ui_show_input
//    show input
//
function mod_ui_show_input() {
   var input_canvas = document.getElementById("mod_input_canvas")
   input_canvas.style.display = "inline"
   }
//
// mod_ui_view_reset
//    reset view
function mod_ui_view_reset() {
   document.mod.dx = ""
   document.mod.dy = ""
   document.mod.dz = ""
   document.mod.rx = ""
   document.mod.ry = ""
   document.mod.rz = ""
   document.mod.s = ""
   }
   
