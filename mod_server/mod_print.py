#!/usr/bin/env python
#
# mod_print.py
#    send a file to a printer device
#
# Neil Gershenfeld
# (c) Massachusetts Institute of Technology 2015
#
# This work may be reproduced, modified, distributed,
# performed, and displayed for any purpose, but must
# acknowledge the fab modules project. Copyright is
# retained and must be preserved. The work is provided
# as is; no warranty is provided, and users accept all 
# liability.
#
# imports
#
import sys,string,threading,time,os
from Tkinter import *
#
# globals
#
WINDOW = 400 # window size
RUN = 0
PAUSE = 1
CANCEL = 2
state = RUN
#
# send routine
#
def send(canvas,data,device,separator):
   global state,tstart
   n = 0
   N = string.count(data,separator)
   #
   # loop over commands
   #
   pointer = 0
   while 1:
      #
      # check for pause
      #
      if (state == PAUSE):
         while (state == PAUSE):
            time.sleep(0.001)
      #
      # check for cancel
      #
      if (state == CANCEL):
         break
      #
      # find next command
      #
      position = string.find(data,separator,pointer)
      if (position == -1):
         #
         # break if not found
         #
         break
      command = data[pointer:(position+1)]
      pointer = position+1
      #
      # send the command
      #
      device.write(command)
      #
      # update the GUI
      #
      n += 1
      percent = (100.0*n)/N
      dt = (time.time()-tstart)/60.0
      totalt = (dt/n)*N
      canvas.itemconfigure("text",text="sending %.1f%% (%.0f/%.0f min)"%(percent,dt,totalt))
      canvas.update()
   device.close()
   os._exit(0)
#
# pause routine
#
def pause():
   global state
   if (state == RUN):
      state = PAUSE
      pause_button.config(text="continue")
   elif (state == PAUSE):
      state = RUN
      pause_button.config(text="pause")
#
# cancel routine
#
def cancel():
   global state
   state = CANCEL
   cancel_button.config(text="canceling ...")
#
# quit routine
#
def quit():
   s.close()
   sys.exit()
#
# command line
#
if (len(sys.argv) != 4):
   print "command line: mod_print.py device separator file"
   print "   device = printer device"
   print "   separator = command separator character ('' to ignore)"
   print "   file = file to send"
   sys.exit(1)
device_name = sys.argv[1]
separator = sys.argv[2]
file_name = sys.argv[3]
#
# open file
#
try:
   file_handle = open(file_name)
   data = file_handle.read()
   file_handle.close()
except:
   print 'error: can not open file '+file_name
   sys.exit(1)
#
# open device
#
try:
   device = open(device_name,'w',0)
except:
   print 'error: can not open device '+device_name
   sys.exit(1)
#
# send file and exit if no command separator
#
if (separator == ''):
   device.write(data)
   device.close()
   sys.exit(0)
#
# if command separator, set up GUI
#
#
# set up GUI
#
root = Tk()
root.title('mod_print.py')
canvas = Canvas(root, width=WINDOW, height=.25*WINDOW, background='white')
canvas.create_text(.5*WINDOW,.1*WINDOW,text="",font=("Helvetica",24),tags="text",fill="#0000b0")
canvas.pack()
pause_button = Button(root,text="pause",command=pause)
pause_button.pack()
cancel_button = Button(root,text="cancel",command=cancel)
cancel_button.pack()
#
# start sending thread
#
tstart = time.time()
t = threading.Thread(target=send,args=(canvas,data,device,separator))
t.start()
#
# start UI loop
#
root.mainloop()

