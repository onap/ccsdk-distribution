'''
/*-
* ============LICENSE_START=======================================================
* ONAP : APPC
* ================================================================================
* Copyright (C) 2019 AT&T Intellectual Property.  All rights reserved.
* ================================================================================
* Copyright (C) 2019 Amdocs
* =============================================================================
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

def ansibleSysCall (inventory_path, playbook_path, nodelist, mandatory, envparameters, localparameters, timeout, playbookdir):
    cherrypy.log( "***> in AnsibleModule.ansibleSysCall")
    log = []

    str_parameters = ''

    if envparameters:
        for key in envparameters:
            if str_parameters == '':
                str_parameters = '"'  + str(key) + '=\'' + str(envparameters[key])  + '\''
            else:
                str_parameters += ' '  + str(key) + '=\'' + str(envparameters[key])  + '\''
                # str_parameters += ', '  + str(key) + '=\'' + str(envparameters[key])  + '\''
        str_parameters += '"'

    if len(str_parameters) > 0:
        cmd = 'cd ' + playbookdir + ';' + 'timeout -s KILL -t ' + str(timeout) + \
              ' ansible-playbook -v --timeout ' + str(timeout) + ' --extra-vars ' + str_parameters + ' -i ' + \
              inventory_path + ' ' + playbook_path + ' | tee log.file'
    else:
        cmd = 'cd ' + playbookdir + ';' + 'timeout -s KILL -t ' + str(timeout) + \
              ' ansible-playbook -v --timeout ' + str(timeout) + ' -i ' + inventory_path + ' ' + playbook_path + ' | tee log.file'

    cherrypy.log("CMD: " + cmd)

    cherrypy.log("PlayBook Start: " + playbookdir )
    p = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, universal_newlines=True)
    #PAP
    #p.wait()
    stdout_value, err = p.communicate()
    stdout_value = stdout_value.splitlines()

    stdout_value_cleanup = []
    for line in stdout_value:
        stdout_value_cleanup.append(line.replace('  ', ' '))
    stdout_value = stdout_value_cleanup

    ParseFlag = False
    retval = {}
    returncode = p.returncode

    if returncode == 137:
        cherrypy.log("   ansible-playbook system call timed out")
        # ansible-playbook system call timed out
        for line in stdout_value: # p.stdout.readlines():
            log.append (line)
    else:
        for line in stdout_value: # p.stdout.readlines():
            if line:
                cherrypy.log("OUTPUT: %s" % line)

            if ParseFlag and len(line.strip())>0:
                ip_address = line.split(':')[0].strip()
                exec_results = line.split(':')[1].strip()

                result_items = [item for item in exec_results.split(' ') if item]
                cherrypy.log("Execcution results of '%s': %s" % (ip_address, str(result_items)))
                # ['ok=6', 'changed=5', 'unreachable=0', 'failed=0', 'skipped=3', 'rescued=0', 'ignored=0']

                ok_flag = result_items[0].split('=')[1].strip()
                changed_flag = result_items[1].split('=')[1].strip()
                unreachable_flag = result_items[2].split('=')[1].strip()
                failed_flag = result_items[3].split('=')[1].strip()

                retval[ip_address]=[ok_flag, changed_flag, unreachable_flag, failed_flag]
            if "PLAY RECAP" in line:
                ParseFlag = True
            log.append (line)
            if "Killed" in line: # check for timeout
                cherrypy.log(" Playbook Killed(timeout)")
                returncode = 137

    # retval['p'] = p.wait()

    #cherrypy.log("*** <" + playbookdir + "> [" + str(log) + "] ***")
    cherrypy.log("PlayBook Complete: " + playbookdir )
    f = open(playbookdir + "/output.log", "w")
    f.write(str(log))
    f.close()

    return retval, log, returncode

if __name__ == '__main__':

    from multiprocessing import Process, Value, Array, Manager
    import time

    nodelist = 'host'

    playbook_file = 'ansible_sleep@0.00.yml'


    d = Manager().dict()

    p = Process(nodelist=ansible_call, args=('ansible_module_config', playbook_file, nodelist,d, ))
    p.start()

    print("Process running")
    print(d)
    p.join()
    print(d)
