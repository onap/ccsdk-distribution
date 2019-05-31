'''
/*-
* ============LICENSE_START=======================================================
* ONAP : APPC
* ================================================================================
* Copyright (C) 2019 AT&T Intellectual Property.  All rights reserved.
* ================================================================================
* Copyright (C) 2019 Amdocs
* ================================================================================
* Copyright (C) 2019 Orange
* ================================================================================
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
* 
* ============LICENSE_END=========================================================
*/
'''

import os, subprocess
import sys
from collections import namedtuple
import json

import uuid
import cherrypy
from cherrypy.lib.httputil import parse_query_string
from cherrypy.lib import auth_basic

def buildHostsSysCall(JsonInput, run_path, inventory_type):

  cherrypy.log( "***> in BuildHostFile.buildHostSysCall")

  # Build host file in run dir
  output_file = open(run_path + "/host_file.txt","w")

  #
  # host vm will be formated based on the inventory_type value passed
  #
  cherrypy.log( "*** buildHostsSysCall -> Inventory_type: "  + inventory_type)

  # print standard header stuff to file
  output_file.write ("[host]\n")
  output_file.write ("localhost   ansible_connection=local\n")

  TypeList=[]

  # print vm type then vm & ips
  for NodeList in JsonInput['NodeList']:
      #print( "" )
      #print ("Node: ")
      #print NodeList
  
      #need to add check that vnfc-type is present in request
      if not ('vnfc-type' in NodeList):
        cherrypy.log( "*** buildHostsSysCall -> vnfc-type Not in NodeList: ")
        return(-1)

      Type =  NodeList['vnfc-type']
      TypeList.append(Type)
  
  
      # Optional Floating Address & VIP Element
      FloatingIP=""
      NE_ID_VIP=""
      if ('floating_ip_address-vip' in NodeList) & ('ne_id_vip' in NodeList): 
        FloatingIP = NodeList['floating_ip_address-vip']
        NE_ID_VIP = NodeList['ne_id_vip']
        #print ("FloatingIP: " + FloatingIP)
        #print ("ne_id_vip: " + NE_ID_VIP)
        output_file.write ("\n[%svip]\n" % Type )
        if inventory_type == "None":
          output_file.write ("%s\n" % (FloatingIP) )
        elif inventory_type == "VNFC" or inventory_type == "VM":
          output_file.write ("%s ansible_host=%s\n" % (NE_ID_VIP, FloatingIP) )
  
      output_file.write ("\n[%s]\n" % Type )
      Site =  NodeList['site']

      #print ("Type: " + Type)
      #print ("Site: " + Site)

      for  vm in NodeList['vm-info']:
          #print ("VM: " )
          #print (vm)
          Name   = vm['ne_id']
          IpAddr = vm['fixed_ip_address']
          #print ("vm: " + Name + ": " + IpAddr)
          if inventory_type == "None":
            output_file.write ("%s\n" % (IpAddr) )
          elif inventory_type == "VNFC" or inventory_type == "VM":
            output_file.write ("%s ansible_host=%s\n" % (Name, IpAddr) )

  # print  site list
  output_file.write ("\n[%s:children]\n" % Site )
  for child_type in TypeList:
      output_file.write ("%s\n" % child_type)


  output_file.close()
  return(0)
