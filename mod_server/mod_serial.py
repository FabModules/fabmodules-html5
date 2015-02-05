#!/usr/bin/env python
#
# mod_serial.py
#    send a serial file with RTS/CTS and DSR/DTR handshaking
#
# Neil Gershenfeld
# (c) Massachusetts Institute of Technology 2014
#
# This work may be reproduced, modified, distributed,
# performed, and displayed for any purpose, but must
# acknowledge the fab modules project. Copyright is
# retained and must be preserved. The work is provided
# as is; no warranty is provided, and users accept all 
# liability.
#

import sys,serial,time,threading,os,time
from Tkinter import *

WINDOW = 400 # window size
RUN = 0
PAUSE = 1
state = RUN

#
# send routine
#
#def send(parent,canvas,data,s):
def send(canvas,data,s):
   global state,tstart
   n = 0
   N = len(data)
   for c in data:
      #
      # check for pause
      #
      if (state == PAUSE):
         while (state == PAUSE):
            time.sleep(0.001)
      #
      # check for flow control handshaking
      #
      if (flow == "dsrdtr"):
         while (s.getDSR() != True):
            time.sleep(0.001)
      elif (flow == "rtscts"):
         while (s.getCTS() != True):
            time.sleep(0.001)
      #
      # send next char
      #
      s.write(c)
      s.flush()
      #
      # update
      #
      n += 1
      percent = (100.0*n)/len(data)
      dt = (time.time() - tstart)/60.
      totalt = (dt/n)*len(data)
      canvas.itemconfigure("text",text="sending %.1f%% (%.0f/%.0f min)"%(percent,dt,totalt))
      canvas.update()
   s.close()
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
   global s
   s.close()
   sys.exit()
#
# quit routine
#
def quit():
   s.close()
   sys.exit()
#
# command line
#
if (len(sys.argv) != 5):
   print "command line: mod_serial.py port speed flow file"
   print "   port = serial port"
   print "   speed = comm speed"
   print "   flow = flow control (none | xonxoff | rtscts | dsrdtr )"
   print "   file = file to send"
   sys.exit()
port = sys.argv[1]
speed = sys.argv[2]
flow = sys.argv[3]
filename = sys.argv[4]
#
# open file
#
f = open(filename)
data = f.read()
f.close()
#
# open port
#
if (flow == "xonxoff"):
   s = serial.Serial(port, baudrate=speed, xonxoff=True, timeout=0)
elif (flow == "rtscts"):
   s = serial.Serial(port, baudrate=speed, rtscts=True, timeout=0)
elif (flow == "dsrdtr"):
   s = serial.Serial(port, baudrate=speed, dsrdtr=True, timeout=0)
elif (flow == "none"):
   s = serial.Serial(port, baudrate=speed, timeout=0)
s.flushInput()
s.flushOutput()
#
# set up GUI
#
root = Tk()
root.title('mod_serial.py')
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
t = threading.Thread(target=send,args=(canvas,data,s))
t.start()
#
# start UI loop
#
root.mainloop()

