#!/usr/bin/python

import sys

print sys.argv

port = sys.argv[1] 
fname = sys.argv[2]

cmd=None

try:
  data_file = open(fname,'r')
  cmd = data_file.read()
  data_file.close()
except:
  print 'Failed to open input file %s' % fname
  sys.exit(1)


if port.count('lp') >= 0:
  f= open(port,'w',0)
  f.write(cmd)
  f.close()

