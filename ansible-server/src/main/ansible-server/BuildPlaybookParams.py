'''
/*-
* ============LICENSE_START=======================================================
* ONAP : APPC
* ================================================================================
* Copyright (C) 2017-2019 AT&T Intellectual Property.  All rights reserved.
* ================================================================================
* Copyright (C) 2017 Amdocs
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

from os import listdir
from os.path import isfile, join
import os.path
import shutil
import subprocess

import cherrypy


def buildInventorySysCall(ansible_path, ansible_inv, node_list, playbook_dir, target_inv, hostgrouplist, hostnamelist):
    if not node_list:
        local_node_list = "host"
        local_credentials = "localhost    ansible_connection=local"

        f = open(playbook_dir + "/" + target_inv, "w")
        f.write("[" + local_node_list + "]\n")
        f.write(local_credentials)
        f.close()
    else:
        # Get credentials from file
        data_inventory_orig = {}
        data_inventory_target = {}
        curr_group = None

        cherrypy.log("***> " + ansible_path + "/" + ansible_inv)
        f = open(ansible_path + "/" + ansible_inv, "r")
        for line in f:
            line = line.rstrip()

            if len(line) > 0:
                if '#' not in line:
                    if "[" in line and "]" in line:
                        data_inventory_orig[line] = []
                        curr_group = line
                    else:
                        data_inventory_orig[curr_group].append(line)
        f.close()

        for node in node_list:
            fail_flag = True
            if "[" + node + "]" in data_inventory_orig:
                if "[" + node + "]" not in data_inventory_target:
                    cherrypy.log("RESET", "[" + node + "]")
                    data_inventory_target["[" + node + "]"] = []
                else:
                    cherrypy.log("OK", "[" + node + "]")
                fail_flag = False
                for cred in data_inventory_orig["[" + node + "]"]:
                    data_inventory_target["[" + node + "]"].append(cred)
            else:
                for key in data_inventory_orig:
                    if node + " " in " ".join(data_inventory_orig[key]):
                        if key not in data_inventory_target:
                            data_inventory_target[key] = []
                        for cred in data_inventory_orig[key]:
                            if node + " " in cred:
                                data_inventory_target[key].append(cred)
                                fail_flag = False

            if fail_flag:
                data_inventory_target["[" + node + "]"] = \
                    [node + " ansible_connection=ssh ansible_ssh_user=na ansible_ssh_private_key_file=na"]

        f = open(playbook_dir + "/" + target_inv, "w")
        for key in data_inventory_target:
            f.write(key + "\n")
            for rec in data_inventory_target[key]:
                hostgrouplist.append(key.replace("[", '').replace("]", ''))
                hostnamelist.append(rec.split(' ')[0])
                f.write(rec + "\n")
        f.close()


def getPlaybookFile(ansible_path, playbook_name, playbook_type, playbook_dir):
    # Get playbooks from files

    version = None
    target_playbook_name = None

    if '@' in playbook_name:
        version = playbook_name.split("@")[1]
        version = version.replace('.yml', '')
        version = version.replace('.tar.gz', '')

    onlyfiles = [f for f in listdir(ansible_path) if isfile(join(ansible_path, f))]

    version_max = '0.00'
    version_target = ''

    for filename in onlyfiles:
        if playbook_type in filename:
            temp_version = filename.split("@")[1]
            temp_version = temp_version.replace('.yml', '')
            temp_version = temp_version.replace('.tar.gz', '')
            if version_max < temp_version:
                version_max = temp_version

            if version is not None:
                if version in playbook_name:
                    version_target = version
                    target_playbook_name = filename

    if target_playbook_name is None:
        for filename in onlyfiles:
            if playbook_type in filename and version_max in filename:
                target_playbook_name = filename
                version_target = version_max

    if target_playbook_name:
        src = ansible_path + "/" + target_playbook_name
        if not os.path.exists(src):
            return ''

        if ".tar.gz" in target_playbook_name:
            dest = playbook_dir + "/" + playbook_type + ".tar.gz"
            shutil.copy2(src, dest)
            subprocess.call(['tar', '-xvzf', dest, "-C", playbook_dir])
        else:
            dest = playbook_dir + "/" + playbook_type + ".yml"
            shutil.copy2(src, dest)

    return version_target
