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

import time, datetime, json, os, sys, subprocess
import uuid
import shutil
import glob
import crypt

import requests

import cherrypy
from cherrypy.lib.httputil import parse_query_string

from multiprocessing import Process, Manager

from AnsibleModule import ansibleSysCall
from BuildHostFile import buildHostsSysCall
from BuildPlaybookParams import buildInventorySysCall, getPlaybookFile

from os import listdir
from os.path import isfile, join

TestRecord = Manager().dict()
ActiveProcess = {}


def validate_password(realm, username, password):
    comp = crypt.crypt(password, salt)
    if username in userpassdict and userpassdict[username] == comp:
        return True
    return False


def sys_call(cmd):
    p = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    output = p.stdout.readlines()
    retval = p.wait()
    if len(output) > 0:
        for i in range(len(output)):
            output[i] = output[i].strip()
    return retval, output


def callback(Id, Result, Output, Log, returncode):
    cherrypy.log("***> in RestServer.callback")

    if Id in TestRecord:
        time_now = datetime.datetime.utcnow()
        delta_time = (time_now - TestRecord[Id]['Time']).total_seconds()
        Result['PlaybookName'] = TestRecord[Id]['PlaybookName']
        Result['Version'] = TestRecord[Id]['Version']
        if returncode == 137:
            Result['StatusCode'] = 500
            Result['StatusMessage'] = "TERMINATED"
        else:
            Result['StatusCode'] = 200
            Result['StatusMessage'] = "FINISHED"

        # Need to update the whole data structure for key=Id otherwise Manager is not updated
        TestRecord[Id] = {
            'PlaybookName': TestRecord[Id]['PlaybookName'],
            'Version': TestRecord[Id]['Version'],
            'NodeList': TestRecord[Id]['NodeList'],
            'HostGroupList': TestRecord[Id]['HostGroupList'],
            'HostNameList': TestRecord[Id]['HostNameList'],
            'Time': TestRecord[Id]['Time'],
            'Timeout': TestRecord[Id]['Timeout'],
            'Duration': str(delta_time),
            'EnvParameters': TestRecord[Id]['EnvParameters'],
            'LocalParameters': TestRecord[Id]['LocalParameters'],
            'FileParameters': TestRecord[Id]['FileParameters'],
            'CallBack': TestRecord[Id]['CallBack'],
            'Result': Result,
            'Log': Log,
            'Output': Output,
            'Path': TestRecord[Id]['Path'],
            'Mandatory': TestRecord[Id]['Path']
        }

        if TestRecord[Id]['CallBack'] is not None:

            # Posting results to callback server
            data = {
                "StatusCode": 200,
                "StatusMessage": "FINISHED",
                "PlaybookName": TestRecord[Id]["PlaybookName"],
                "Version": TestRecord[Id]["Version"],
                "Duration": TestRecord[Id]["Duration"],
                "Results": TestRecord[Id]['Result']['Results']
            }

            cherrypy.log("CALLBACK: TestRecord[Id]['Output']['Output']:", str(TestRecord[Id]['Output']['Output']))
            cherrypy.log("CALLBACK: Results:", str(data["Results"]))

            if not TestRecord[Id]['Output']['Output'] == {}:
                for key in data["Results"]:
                    if key in TestRecord[Id]['Output']['Output']:
                        data["Results"][key]["Output"] = TestRecord[Id]['Output']['Output'][key]

            cherrypy.log("     Posting to", TestRecord[Id]['CallBack'])

            s = requests.Session()
            r = s.post(TestRecord[Id]['CallBack'], data=json.dumps(data),
                       headers={'content-type': 'application/json'})
            cherrypy.log("     Response", r.status_code, r.text)


def RunAnsible_Playbook(callback, Id, Inventory, Playbook, NodeList, TestRecord, Path, ArchiveFlag, pnf_flag=False):
    cherrypy.log("***> in RestServer.RunAnsible_Playbook")

    # Run test in playbook for given target
    retval, log, returncode = ansibleSysCall(Inventory, Playbook, NodeList,
                                             TestRecord[Id]['Mandatory'],
                                             TestRecord[Id]['EnvParameters'],
                                             TestRecord[Id]['LocalParameters'],
                                             TestRecord[Id]['Timeout'],
                                             Path)

    cherrypy.log("Return code:" + str(returncode))
    cherrypy.log("Return value:" + str(retval))

    Log = ''.join(log)
    if pnf_flag:
        Output = {'Output': {}}
    else:
        Output = {}

    onlyfiles = [f for f in listdir(Path)
                 if isfile(join(Path, f))]

    cherrypy.log("Checking for results.txt files: ")
    for file in onlyfiles:
        if "results.txt" in file:
            # if file.endswith("results.txt"):
            cherrypy.log("results file: " + file)
            f = open(Path + "/" + file, "r")
            if pnf_flag:
                key = file.split("_")[0]
                Output['Output'][key] = f.read()
            else:
                resultsData = f.read()  # Not to pass vnf instance name
                OutputP = json.loads(resultsData)
                Output['Output'] = OutputP
            cherrypy.log("Output = " + str(Output['Output']))
            # Output['Output'][key] = f.read() # To pass vnf instance name
            f.close()

    if Output == {}:
        Output = {'Output': {}}

    Result = {'Results': {}}
    if 'could not be found' in Log:
        Result['Results'] = {"StatusCode": 101, "StatusMessage": "PLAYBOOK NOT FOUND"}

    if returncode == 137:
        Result['Results'] = {"StatusCode": 500, "StatusMessage": "TERMINATED"}
    elif TestRecord[Id]['NodeList'] == []:
        host_index = None
        if 'TargetNode' in TestRecord[Id]['EnvParameters']:
            targetlist = TestRecord[Id]['EnvParameters']['TargetNode'].split(' ')
        else:
            targetlist = ["localhost"]

        for key in retval:
            for i in range(len(targetlist)):
                if key in targetlist[i]:
                    host_index = i

            if int(retval[key][0]) > 0 and int(retval[key][2]) == 0 and int(retval[key][3]) == 0:
                if host_index:
                    Result['Results'][targetlist[host_index]] = \
                        {"GroupName": 'na', "StatusCode": 200, "StatusMessage": "SUCCESS"}
                else:
                    Result['Results'][key] = {"GroupName": 'na', "StatusCode": 200, "StatusMessage": "SUCCESS"}
            elif int(retval[key][2]) > 0:
                if host_index:
                    Result['Results'][targetlist[host_index]] = \
                        {"GroupName": 'na', "StatusCode": 400, "StatusMessage": "NOT REACHABLE"}
                else:
                    Result['Results'][key] = \
                        {"GroupName": 'na', "StatusCode": 400, "StatusMessage": "NOT REACHABLE"}
            elif int(retval[key][3]) > 0:
                if host_index:
                    Result['Results'][targetlist[host_index]] = \
                        {"GroupName": 'na', "StatusCode": 400, "StatusMessage": "FAILURE"}
                else:
                    Result['Results'][key] = \
                        {"GroupName": 'na', "StatusCode": 400, "StatusMessage": "FAILURE"}
    else:
        for key in retval:
            if len(TestRecord[Id]['HostNameList']) > 0:
                host_index = []
                for i in range(len(TestRecord[Id]['HostNameList'])):
                    if key in TestRecord[Id]['HostNameList'][i]:
                        host_index.append(i)

                if int(retval[key][0]) > 0 and int(retval[key][2]) == 0 and \
                        int(retval[key][3]) == 0:
                    if len(host_index) > 0:
                        Result['Results'][TestRecord[Id]['HostNameList'][host_index[0]]] = \
                            {
                                "GroupName": TestRecord[Id]['HostGroupList'][host_index[0]],
                                "StatusCode": 200, "StatusMessage": "SUCCESS"
                            }

                        for i in range(1, len(host_index)):
                            Result['Results'][TestRecord[Id]['HostNameList'][host_index[i]]]["GroupName"] += \
                                "," + TestRecord[Id]['HostGroupList'][host_index[i]]
                    else:
                        Result['Results'][key] = {"GroupName": key, "StatusCode": 200, "StatusMessage": "SUCCESS"}

                elif int(retval[key][2]) > 0:
                    if len(host_index) > 0:
                        Result['Results'][TestRecord[Id]['HostNameList'][host_index[0]]] = \
                            {
                                "GroupName": TestRecord[Id]['HostGroupList'][host_index[0]],
                                "StatusCode": 400, "StatusMessage": "NOT REACHABLE"
                            }

                        for i in range(1, len(host_index)):
                            Result['Results'][TestRecord[Id]['HostNameList'][host_index[i]]]["GroupName"] += \
                                "," + TestRecord[Id]['HostGroupList'][host_index[i]]
                    else:
                        Result['Results'][key] = \
                            {"GroupName": key, "StatusCode": 200, "StatusMessage": "NOT REACHABLE"}
                elif int(retval[key][3]) > 0:
                    if len(host_index) > 0:
                        Result['Results'][TestRecord[Id]['HostNameList'][host_index[0]]] = \
                            {
                                "GroupName": TestRecord[Id]['HostGroupList'][host_index[0]],
                                "StatusCode": 400, "StatusMessage": "FAILURE"
                            }

                        for i in range(1, len(host_index)):
                            Result['Results'][TestRecord[Id]['HostNameList'][host_index[i]]]["GroupName"] += \
                                "," + TestRecord[Id]['HostGroupList'][host_index[i]]
                    else:
                        Result['Results'][key] = \
                            {"GroupName": key, "StatusCode": 200, "StatusMessage": "FAILURE"}
            else:
                host_index = None
                for i in range(len(TestRecord[Id]['NodeList'])):
                    if key in TestRecord[Id]['NodeList'][i]:
                        host_index = i

                if int(retval[key][0]) > 0 and int(retval[key][2]) == 0 and \
                        int(retval[key][3]) == 0:
                    Result['Results'][TestRecord[Id]['NodeList'][host_index]] = \
                        {"GroupName": 'na', "StatusCode": 200, "StatusMessage": "SUCCESS"}
                elif int(retval[key][2]) > 0:
                    Result['Results'][TestRecord[Id]['NodeList'][host_index]] = \
                        {"GroupName": 'na', "StatusCode": 400, "StatusMessage": "NOT REACHABLE"}
                elif int(retval[key][3]) > 0:
                    Result['Results'][TestRecord[Id]['NodeList'][host_index]] = \
                        {"GroupName": 'na', "StatusCode": 400, "StatusMessage": "FAILURE"}

    callback(Id, Result, Output, Log, returncode)


def store_local_vars(playbook_path, Id):
    if not os.path.exists(playbook_path + "/vars"):
        os.mkdir(playbook_path + "/vars")

    if not os.path.isfile(playbook_path + "/vars/defaults.yml"):
        os.mknod(playbook_path + "/vars/defaults.yml")

    # ##################################################
    # PAP
    # write local parameters passed into defaults.yml
    # PAP
    local_parms = TestRecord[Id]['LocalParameters']
    cherrypy.log("LocalParameters: " + str(local_parms))

    f = open(playbook_path + "/vars/defaults.yml", "a")
    for key, value in list(local_parms.items()):
        f.write(key + "=" + value + "\n")
    f.close()
    # ##################################################

    for key in TestRecord[Id]['LocalParameters']:
        host_index = []
        for i in range(len(TestRecord[Id]['HostNameList'])):
            if key in TestRecord[Id]['HostNameList'][i]:
                host_index.append(i)
        if len(host_index) == 0:
            for i in range(len(TestRecord[Id]['HostGroupList'])):
                if key in TestRecord[Id]['HostGroupList'][i]:
                    host_index.append(i)
        if len(host_index) > 0:
            for i in range(len(host_index)):
                f = open(playbook_path + "/vars/" + TestRecord[Id]['HostNameList'][host_index[i]] + ".yml", "a")
                for param in TestRecord[Id]['LocalParameters'][key]:
                    f.write(param + ": " + str(TestRecord[Id]['LocalParameters'][key][param]) + "\n")
                f.close()


def process_pnf_playbook(input_json, Id, EnvParameters, time_now):
    cherrypy.log("Processing playbook for PNF...")

    PlaybookName = input_json['PlaybookName']
    version = input_json.get('Version', None)

    if AUTH:
        cherrypy.log("Request USER  :                  " + cherrypy.request.login)
    cherrypy.log("Request Decode: ID               " + Id)
    cherrypy.log("Request Decode: EnvParameters    " + json.dumps(EnvParameters))
    cherrypy.log("Request Decode: PlaybookName     " + PlaybookName)

    for key in EnvParameters:
        value = EnvParameters[key]
        if isinstance(value, (list, dict)):
            valueStr = json.dumps(value)
            # Need to dump two times to keep the backslash and double quotes, add backslash and single quotes for spaces
            EnvParameters[key] = "\\'" + json.dumps(valueStr)[1:-1] + "\\'"

    str_uuid = str(uuid.uuid4())

    HomeDir = os.path.dirname(os.path.realpath("~/"))

    PlaybookType = PlaybookName.split(".")[0].split('_')[-1]
    PlaybookDir = HomeDir + '/' + ANSIBLE_TEMP + "/" + PlaybookName.split(".")[0] + "_" + str_uuid
    AnsibleInv = PlaybookType + "_" + "inventory"
    ArchiveFlag = False

    cherrypy.log("Request Decode: PlaybookType     " + PlaybookType)
    cherrypy.log("Request Decode: PlaybookDir      " + PlaybookDir)
    cherrypy.log("Request Decode: AnsibleInv       " + AnsibleInv)

    NodeList = input_json.get('NodeList', [])
    cherrypy.log("Request Decode: NodeList: " + str(NodeList))

    # Create base run directory if it doesn't exist
    if not os.path.exists(ANSIBLE_TEMP):
        cherrypy.log("Creating Base Run Directory: " + ANSIBLE_TEMP)
        os.makedirs(ANSIBLE_TEMP)

    os.mkdir(PlaybookDir)

    # Process inventory file for target
    hostgrouplist = []
    hostnamelist = []

    buildInventorySysCall(ANSIBLE_PATH, ANSIBLE_INV, NodeList, PlaybookDir, AnsibleInv, hostgrouplist, hostnamelist)

    version_target = getPlaybookFile(ANSIBLE_PATH, PlaybookName, PlaybookType, PlaybookDir)
    if not version_target:
        return {"StatusCode": 101, "StatusMessage": "PLAYBOOK NOT FOUND"}

    if version is None:
        version = version_target

    if 'Timeout' in input_json:
        timeout = int(input_json['Timeout'])
        cherrypy.log("Timeout from API: " + str(timeout))
    else:
        timeout = timeout_seconds
        cherrypy.log("Timeout not passed from API using default: " + str(timeout))

    EnvParam = input_json.get('EnvParameters', {})
    LocalParam = input_json.get('LocalParameters', {})
    FileParam = input_json.get('FileParameters', {})
    callback_flag = input_json.get('CallBack', None)

    # if AnsibleServer is not set to 'na' don't send AnsibleServer in PENDING response.
    TestRecord[Id] = {
        'PlaybookName': PlaybookName,
        'Version': version,
        'NodeList': NodeList,
        'HostGroupList': hostgrouplist,
        'HostNameList': hostnamelist,
        'Time': time_now,
        'Duration': timeout,
        'Timeout': timeout,
        'EnvParameters': EnvParam,
        'LocalParameters': LocalParam,
        'FileParameters': FileParam,
        'CallBack': callback_flag,
        'Result': {
            "StatusCode": 100,
            "StatusMessage": 'PENDING',
            "ExpectedDuration": str(timeout) + "sec"
        },
        'Log': '',
        'Output': {},
        'Path': PlaybookDir,
        'Mandatory': None
    }
    if AnsibleServer != 'na':
        TestRecord[Id]['Result']["AnsibleServer"] = str(AnsibleServer),

    cherrypy.log("Test_Record: " + str(TestRecord[Id]))

    # Write files
    if TestRecord[Id]['FileParameters']:
        for key in TestRecord[Id]['FileParameters']:
            filename = key
            filecontent = TestRecord[Id]['FileParameters'][key]
            f = open(PlaybookDir + "/" + filename, "w")
            f.write(filecontent)
            f.close()

    playbook_path = PlaybookDir

    # Store local vars
    store_local_vars(playbook_path, Id)

    # write some info out to files before running
    if AUTH:
        f = open(playbook_path + "/User.txt", "a")
        f.write(cherrypy.request.login)
        f.close()

    f = open(playbook_path + "/PlaybookName.txt", "a")
    f.write(PlaybookName)
    f.close()

    f = open(playbook_path + "/JsonRequest.txt", "w")
    f.write(json.dumps(input_json, indent=4, sort_keys=True))
    f.close()

    # Cannot use thread because ansible module uses signals which are only supported in main thread.
    # So use multiprocess with shared object
    p = Process(target=RunAnsible_Playbook,
                args=(callback, Id, PlaybookDir + '/' + AnsibleInv, PlaybookDir + '/' + PlaybookType + '.yml',
                      NodeList, TestRecord, PlaybookDir, ArchiveFlag, True))
    p.start()
    ActiveProcess[Id] = p
    return TestRecord[Id]['Result']


def process_vnf_playbook(input_json, Id, EnvParameters, time_now):
    cherrypy.log("Processing playbook for VNF...")

    PlaybookName = input_json['PlaybookName']
    VNF_instance = EnvParameters.get('vnf_instance')
    version = input_json.get('Version', None)

    # GetInventoryNames
    HaveNodeList = False
    HaveInventoryNames = False
    inventory_names = None
    if 'InventoryNames' in input_json:
        inventory_names = input_json['InventoryNames']
        HaveInventoryNames = True

    AnsiblePlaybookFail = True

    str_uuid = str(uuid.uuid4())

    # VnfType = PlaybookName.split("/")[0]

    if AUTH:
        cherrypy.log("Request USER  :                  " + cherrypy.request.login)
    cherrypy.log("Request Decode: ID               " + Id)
    # cherrypy.log("Request Decode: VnfType          " + VnfType)
    cherrypy.log("Request Decode: EnvParameters    " + json.dumps(EnvParameters))

    # Verify VNF_instance was passed in EnvParameters
    if VNF_instance is not None:
        cherrypy.log("Request Decode: VnfInstance      " + VNF_instance)
    else:
        cherrypy.log("StatusCode: 107, StatusMessage: VNF_instance NOT PROVIDED")
        return {"StatusCode": 107, "StatusMessage": "VNF_instance NOT PROVIDED"}

    if inventory_names is not None:
        cherrypy.log("Request Decode: Inventory Names  " + inventory_names)
    else:
        cherrypy.log("Request Decode: Inventory Names  " + "Not provided")

    cherrypy.log("Request Decode: PlaybookName     " + PlaybookName)

    PlayBookFunction = PlaybookName.rsplit("/", 2)[1]
    PlayBookFile = PlayBookFunction + "/site.yml"

    cherrypy.log("Request Decode: PlaybookFunction " + PlayBookFunction)
    cherrypy.log("Request Decode: PlaybookFile     " + PlayBookFile)

    BaseDir = ANSIBLE_PATH + "/" + PlaybookName.rsplit("/", 1)[0]
    CopyDir = ANSIBLE_PATH + "/" + PlaybookName.rsplit("/", 2)[0]
    cherrypy.log("Request Decode: Basedir          " + BaseDir)
    cherrypy.log("Request Decode: Copydir          " + CopyDir)

    PlaybookDir = ANSIBLE_TEMP + "/" + VNF_instance + "_" + str_uuid + "_" + str(Id)
    cherrypy.log("Request Decode: PlaybookDir      " + PlaybookDir)

    # AnsibleInv is the directory where the host file to be run exists
    # AnsibleInv = ANSIBLE_PATH + "/" + VnfType + "/latest/ansible/inventory/" + VNF_instance
    ArchiveFlag = False

    # Create base run directory if it doesn't exist
    if not os.path.exists(ANSIBLE_TEMP):
        cherrypy.log("Creating Base Run Directory: " + ANSIBLE_TEMP)
        os.makedirs(ANSIBLE_TEMP)

    if not os.path.exists(CopyDir):
        cherrypy.log("Playbook Not Found")
        return {"StatusCode": 101, "StatusMessage": "PLAYBOOK NOT FOUND"}

    # copy static playbook dir to run dir
    cherrypy.log("Copying from " + CopyDir + " to " + PlaybookDir)
    shutil.copytree(CopyDir, PlaybookDir)
    # cmd="/usr/bin/find " + PlaybookDir + " -exec /usr/bin/touch {} \;"
    cmd = "/usr/bin/find " + PlaybookDir + " -exec chmod +rx  {} \;"
    sys_call(cmd)
    cherrypy.log(cmd)

    cherrypy.log("PlaybookDir:    " + PlaybookDir)
    # cherrypy.log("AnsibleInv:     " + AnsibleInv)

    # Process inventory file for target
    hostgrouplist = []
    hostnamelist = []

    NodeList = input_json.get('NodeList', [])

    cherrypy.log("NodeList: " + str(NodeList))

    # if NodeList empty
    if not NodeList:
        cherrypy.log("*** NodeList - Empty ***")
    else:
        HaveNodeList = True

    # ##############################################################################
    # #### Host file processing                          ###########################
    # #### 1. Use file delivered with playbook           ###########################
    # #### 2. If HostNames + NodeList generate and use   ###########################
    # ##############################################################################

    # Verify inventory directory exists
    path = PlaybookDir + "/inventory/"
    if not os.path.isdir(path):
        cherrypy.log("Inventory directory %s does not exist - create it" % path)
        try:
            os.mkdir(path)
        except OSError:
            cherrypy.log("Creation of the directory %s failed" % path)
        else:
            cherrypy.log("Successfully created the directory %s " % path)

    # location of host file - Default
    HostFile = PlaybookDir + "/inventory/" + VNF_instance + "hosts"
    cherrypy.log("HostFile: " + HostFile)

    # if NodeList and InventoryNames need to build host file
    if HaveInventoryNames and HaveNodeList:
        cherrypy.log("Build host file from NodeList")
        ret = buildHostsSysCall(input_json, PlaybookDir, inventory_names)
        if ret < 0:
            cherrypy.log("Returning Error: Not running Playbook")
            return {"StatusCode": 105,
                    "StatusMessage": "NodeList: Missing vnfc-type field"}

        # Having been built now copy new file to correct file
        shutil.copy(PlaybookDir + "/host_file.txt", HostFile)
        cherrypy.log("Copying Generated host file to: " + HostFile)

    if 'Timeout' in input_json:
        timeout = int(input_json['Timeout'])
        cherrypy.log("Timeout from API: " + str(timeout))
    else:
        timeout = timeout_seconds
        cherrypy.log("Timeout not passed from API using default: " + str(timeout))

    EnvParam = input_json.get('EnvParameters', {})
    LocalParam = input_json.get('LocalParameters', {})
    FileParam = input_json.get('FileParameters', {})
    callback_flag = input_json.get('CallBack', None)

    # if AnsibleServer is not set to 'na' don't send AnsibleServer in PENDING response.
    TestRecord[Id] = {
        'PlaybookName': PlaybookName,
        'Version': version,
        'NodeList': NodeList,
        'HostGroupList': hostgrouplist,
        'HostNameList': hostnamelist,
        'Time': time_now,
        'Duration': timeout,
        'Timeout': timeout,
        'EnvParameters': EnvParam,
        'LocalParameters': LocalParam,
        'FileParameters': FileParam,
        'CallBack': callback_flag,
        'Result': {
            "StatusCode": 100,
            "StatusMessage": 'PENDING',
            "ExpectedDuration": str(timeout) + "sec"
        },
        'Log': '',
        'Output': {},
        'Path': PlaybookDir,
        'Mandatory': None
    }
    if AnsibleServer != 'na':
        TestRecord[Id]['Result']["AnsibleServer"] = str(AnsibleServer),

    cherrypy.log("Test_Record: " + str(TestRecord[Id]))

    # Write files
    if TestRecord[Id]['FileParameters']:
        for key in TestRecord[Id]['FileParameters']:
            filename = key
            filecontent = TestRecord[Id]['FileParameters'][key]
            f = open(PlaybookDir + "/" + filename, "w")
            f.write(filecontent)
            f.close()

    # Process playbook
    if os.path.exists(ANSIBLE_PATH + '/' + PlaybookName):
        AnsiblePlaybookFail = False

    if AnsiblePlaybookFail:
        # if os.path.exists(PlaybookDir):
        # shutil.rmtree (PlaybookDir)
        cherrypy.log("AnsiblePlaybookFail")
        del TestRecord[Id]
        return {"StatusCode": 101, "StatusMessage": "PLAYBOOK NOT FOUND"}
    else:
        # Test EnvParameters
        playbook_path = PlaybookDir

        # Store local vars
        store_local_vars(playbook_path, Id)

        # write some info out to files before running
        if AUTH:
            f = open(playbook_path + "/User.txt", "a")
            f.write(cherrypy.request.login)
            f.close()

        f = open(playbook_path + "/PlaybookName.txt", "a")
        f.write(PlaybookName)
        f.close()

        f = open(playbook_path + "/PlaybookExDir.txt", "a")
        f.write(PlaybookDir + "/" + PlayBookFunction)
        f.close()

        f = open(playbook_path + "/JsonRequest.txt", "w")
        f.write(json.dumps(input_json, indent=4, sort_keys=True))
        f.close()

        # Check that HostFile exists
        if not os.path.isfile(HostFile):
            cherrypy.log("Inventory file Not Found: " + HostFile)
            return {"StatusCode": 101, "StatusMessage": "PLAYBOOK INVENTORY FILE NOT FOUND"}

        # Cannot use thread because ansible module uses signals which are only supported in main thread.
        # So use multiprocess with shared object
        p = Process(target=RunAnsible_Playbook,
                    args=(callback, Id, HostFile, PlaybookDir + '/' + PlayBookFile,
                          NodeList, TestRecord, PlaybookDir + "/" + PlayBookFunction, ArchiveFlag))
        p.start()
        ActiveProcess[Id] = p
        return TestRecord[Id]['Result']


def handle_post_method(input_json, time_now):
    cherrypy.log("Payload: " + str(input_json))

    if 'Id' in input_json and 'PlaybookName' in input_json and 'EnvParameters' in input_json:
        if input_json['Id'] not in TestRecord:
            # check if Id exists in previous run directory, if so return error
            Id = input_json['Id']
            if glob.glob(ANSIBLE_TEMP + '/*_' + input_json['Id']):
                cherrypy.log("Old directory found for ID: " + Id)
                return {"StatusCode": 101, "StatusMessage": "TEST ID FILE ALREADY DEFINED"}

            # if required it should be passed as an argument
            EnvParameters = input_json.get('EnvParameters', {})

            # The lines below are to test multiple EnvParameters being passed
            # for i in EnvParameters:
            #   cherrypy.log("EnvParameter object: " + i)
            #   cherrypy.log("  EnvParameter Value: " + EnvParameters[ i ])

            pnf_flag = EnvParameters.get("pnf-flag", "")
            if pnf_flag == "true":
                return process_pnf_playbook(input_json, Id, EnvParameters, time_now)
            else:
                return process_vnf_playbook(input_json, Id, EnvParameters, time_now)
        else:
            cherrypy.log("TEST ID ALREADY DEFINED")
            return {"StatusCode": 101, "StatusMessage": "TEST ID ALREADY DEFINED"}
    else:
        return {"StatusCode": 500, "StatusMessage": "JSON OBJECT MUST INCLUDE: ID, PLAYBOOKNAME, EnvParameters"}


def handle_get_method(input_data):
    # Verify we have a Type passed in GET request
    if 'Type' not in input_data:
        return {"StatusCode": 500, "StatusMessage": "RESULTS TYPE UNDEFINED"}

    if AUTH:
        cherrypy.log("Request USER:             " + cherrypy.request.login)
    cherrypy.log("Payload: " + str(input_data) + " Type " + input_data['Type'])

    if 'LogRest' in input_data['Type']:
        sys.stdout.close()
        sys.stdout = open("/var/log/RestServer.log", "w")

    # Just a debug to dump any records
    if 'GetStatus' in input_data['Type']:
        cherrypy.log("******** Dump Records **********")
        if list(TestRecord.items()):
            for id, record in list(TestRecord.items()):
                cherrypy.log("    Id: " + id)
                cherrypy.log("Record: " + str(record))
        else:
            cherrypy.log(" No Records to dump")

    if 'Id' in input_data and 'Type' in input_data:
        if not ('GetResult' in input_data['Type'] or 'GetOutputLog' in input_data['Type'] or
                'GetTheOutput' in input_data['Type'] or 'GetOutput' in input_data['Type'] or
                'GetLog' in input_data['Type']):
            return {"StatusCode": 500, "StatusMessage": "RESULTS TYPE UNDEFINED"}

        if input_data['Id'] in TestRecord:
            if 'GetResult' in input_data['Type']:
                cherrypy.log(" ** GetResult for: " + str(input_data['Id']))
                if 'StatusMessage' in TestRecord[input_data['Id']]['Result'] and getresults_block:
                    # check if playbook is still running
                    while ActiveProcess[input_data['Id']].is_alive():
                        cherrypy.log("*** Playbook running returning PENDING for " + str(input_data['Id']))
                        # If still running return PENDING response
                        # if AnsibleServer != 'na':
                        #     return {"StatusCode": 100, "StatusMessage": 'PENDING', "AnsibleServer": str(AnsibleServer)}
                        # else:
                        #    return {"StatusCode": 100, "StatusMessage": 'PENDING'}
                        time.sleep(3)

                    # cherrypy.log( "*** Request released " + input_data['Id'])

                cherrypy.log(str(TestRecord[input_data['Id']]['Result']))
                cherrypy.log("Output: " + str(TestRecord[input_data['Id']]['Output']))
                cherrypy.log("StatusCode: " + str(TestRecord[input_data['Id']]['Result']['StatusCode']))
                cherrypy.log("StatusMessage: " + str(TestRecord[input_data['Id']]['Result']['StatusMessage']))

                # out_obj gets returned to GET request
                if TestRecord[input_data['Id']]['Result']['StatusCode'] == 500:
                    out_obj = TestRecord[input_data['Id']]['Result']['Results']
                else:
                    out_obj = {
                        "StatusCode": 200,
                        "StatusMessage": "FINISHED",
                        "PlaybookName": TestRecord[input_data['Id']]["PlaybookName"],
                        "Version": TestRecord[input_data['Id']]["Version"],
                        "Duration": TestRecord[input_data['Id']]["Duration"],
                        "Output": TestRecord[input_data['Id']]["Output"]["Output"],
                        "Results": TestRecord[input_data['Id']]['Result']['Results']
                    }
                if not TestRecord[input_data['Id']]['Output']['Output'] == {}:
                    cherrypy.log("TestRecord has Output:" + str(TestRecord[input_data['Id']]['Output']['Output']))
                    # PAP
                    for key in out_obj["Results"]:
                        cherrypy.log("Output key: " + str(key))
                        if key in TestRecord[input_data['Id']]['Output']['Output']:
                            out_obj["Results"][key]["Output"] = TestRecord[input_data['Id']]['Output']['Output'][key]

                cherrypy.log("***** GET RETURNING RESULTS Back ****")
                cherrypy.log(str(out_obj))
                return out_obj
            elif 'GetStatus' in input_data['Type']:
                cherrypy.log(" Dump Records")
                for id, record in list(TestRecord.items()):
                    cherrypy.log(" id: " + id)
                    cherrypy.log("   Record:" + str(record))
            elif 'GetTheOutput' in input_data['Type'] or 'GetOutput' in input_data['Type']:
                if TestRecord[input_data['Id']]['Output'] == {} and getresults_block:
                    cherrypy.log("*** Request blocked " + input_data['Id'])

                    # while TestRecord[input_data['Id']]['Output'] == {} \
                    #         or 'StatusMessage' in TestRecord[input_data['Id']]['Result']:
                    while ActiveProcess[input_data['Id']].is_alive():
                        time.sleep(3)

                    cherrypy.log("*** Request released " + input_data['Id'])

                cherrypy.log("Output: " + str(TestRecord[input_data['Id']]['Output']))
                return {"Output": TestRecord[input_data['Id']]['Output']['Output']}
            elif 'GetOutputLog' in input_data['Type']:
                cherrypy.log("GetOutputLog: processing.")
                if glob.glob(ANSIBLE_TEMP + '/*_' + input_data['Id']):
                    id = input_data['Id']
                    cherrypy.log("Old directory found for ID: " + id)
                    run_dir = glob.glob(ANSIBLE_TEMP + '/*_' + input_data['Id'])
                    for dir in run_dir:
                        rdir = dir
                    if os.path.exists(rdir + "/PlaybookExDir.txt"):
                        cherrypy.log("Found PlaybookExDir.txt file")
                        f = open(rdir + '/PlaybookExDir.txt', 'r')
                        playbookexdir = f.readline()
                        rdir = playbookexdir
                        f.close()
                    cherrypy.log("Id:     " + id)
                    cherrypy.log("RunDir: " + rdir)
                    if os.path.exists(rdir + "/output.log"):
                        cherrypy.log("Found output.log file")
                        f = open(rdir + '/output.log', 'r')
                        output_log = f.readline()
                        f.close()
                        return output_log
                else:
                    cherrypy.log("Globglob failed:")
                    return

            else:
                # GetLog
                if TestRecord[input_data['Id']]['Log'] == '' and \
                        getresults_block:

                    cherrypy.log("*** Request blocked " + input_data['Id'])

                    while TestRecord[input_data['Id']]['Log'] == '' \
                            or 'StatusMessage' in TestRecord[input_data['Id']]['Result']:
                        time.sleep(5)

                    cherrypy.log("*** Request released " + input_data['Id'])

                cherrypy.log("Log:" + str(TestRecord[input_data['Id']]['Log']))
                return {"Log": TestRecord[input_data['Id']]['Log']}
        else:
            # Not in memory check for a file
            if glob.glob(ANSIBLE_TEMP + '/*_' + input_data['Id']):
                id = input_data['Id']
                cherrypy.log("Old directory found for ID: " + id)
                run_dir = glob.glob(ANSIBLE_TEMP + '/*_' + input_data['Id'])
                for dir in run_dir:
                    rdir = dir
                if os.path.exists(rdir + "/PlaybookExDir.txt"):
                    cherrypy.log("Found PlaybookExDir.txt file")
                    f = open(rdir + '/PlaybookExDir.txt', 'r')
                    playbookexdir = f.readline()
                    rdir = playbookexdir
                    f.close()
                cherrypy.log("Id:     " + id)
                cherrypy.log("RunDir: " + rdir)
                if 'GetLog' in input_data['Type']:
                    if os.path.exists(rdir + "/output.log"):
                        cherrypy.log("Found output.log file")
                        f = open(rdir + '/output.log', 'r')
                        output_log = f.readline()
                        f.close()
                        return output_log
                elif 'GetOutputLog' in input_data['Type']:
                    if os.path.exists(rdir + "/output.log"):
                        cherrypy.log("Found output.log file")
                        f = open(rdir + '/output.log', 'r')
                        output_log = f.readline()
                        f.close()
                        return output_log
                elif 'GetResult' in input_data['Type']:
                    if os.path.exists(rdir + "/PlaybookName.txt"):
                        cherrypy.log("Found PlaybookName.txt file")
                        f = open(rdir + '/PlaybookName.txt', 'r')
                        playbooknametxt = f.readline()
                        f.close()
                    else:
                        playbooknametxt = "NA"

                    # Add code to get other items not just output.log from files
                    if os.path.exists(rdir + "/log.file"):
                        cherrypy.log("Found log.file")
                        out_results = "NA:"

                        f = open(rdir + '/log.file', 'r')
                        line = f.readline()
                        while line:
                            if "fatal" in line:
                                out_results = out_results + line
                            elif "RECAP" in line:
                                out_results = out_results + line
                                recap_line = f.readline()
                                while recap_line:
                                    out_results = out_results + recap_line
                                    recap_line = f.readline()
                            line = f.readline()
                        f.close()
                        out_obj = {
                            "StatusCode": 200,
                            "StatusMessage": "FINISHED",
                            "PlaybookName": playbooknametxt,
                            "Version": "Version",
                            "Duration": 200,
                            "Results": out_results
                        }
                        return out_obj
                else:
                    return {"StatusCode": 500, "StatusMessage": "PLAYBOOK FAILED "}

            return {"StatusCode": 500, "StatusMessage": "TEST ID UNDEFINED"}
    else:
        return {"StatusCode": 500, "StatusMessage": "MALFORMED REQUEST"}


def handle_delete_method(input_data):
    cherrypy.log("***> in RestServer.DELETE")
    cherrypy.log("Payload: " + str(input_data))

    if input_data['Id'] in TestRecord:
        if 'PENDING' not in TestRecord[input_data['Id']]['Result']:
            cherrypy.log(" Path: " + str(TestRecord[input_data['Id']]['Path']))
            TestRecord.pop(input_data['Id'])
            if input_data['Id'] in ActiveProcess:
                ActiveProcess.pop(input_data['Id'])
            return {"StatusCode": 200, "StatusMessage": "PLAYBOOK EXECUTION RECORDS DELETED"}
        else:
            return {"StatusCode": 200, "StatusMessage": "PENDING"}
    else:
        return {"StatusCode": 500, "StatusMessage": "TEST ID UNDEFINED"}


class TestManager(object):
    @cherrypy.expose
    @cherrypy.tools.json_out()
    @cherrypy.tools.json_in()
    @cherrypy.tools.allow(methods=['POST', 'GET', 'DELETE'])
    def Dispatch(self, **kwargs):
        # Let cherrypy error handler deal with malformed requests
        # No need for explicit error handler, we use default ones

        time_now = datetime.datetime.utcnow()

        # Erase old test results (2x timeout)
        # Do cleanup too of ActiveProcess list and old Records - PAP
        if TestRecord:
            for key in TestRecord.copy():
                cherrypy.log("LOOKING AT ALL TestRecords: " + str(key))
                if key in ActiveProcess:
                    if not ActiveProcess[key].is_alive():  # Just to cleanup defunct processes
                        cherrypy.log("Not ActiveProcess for ID: " + str(key))
                delta_time = (time_now - TestRecord[key]['Time']).seconds
                if delta_time > 2 * TestRecord[key]['Timeout']:
                    cherrypy.log("DELETED HISTORY for ID: " + str(key))
                    if key in ActiveProcess:
                        if not ActiveProcess[key].is_alive():
                            ActiveProcess.pop(key)
                            cherrypy.log("DELETED ActiveProcess for ID: " + str(key))
                    # if os.path.exists(TestRecord[key]['Path']):
                    # don't remove run dirrectory
                    # shutil.rmtree (TestRecord[key]['Path'])
                    del TestRecord[key]

        cherrypy.log("RestServer.Dispatch: " + cherrypy.request.method)

        if 'POST' in cherrypy.request.method:
            input_json = cherrypy.request.json
            return handle_post_method(input_json, time_now)
        elif 'GET' in cherrypy.request.method:
            # Lets pause for a second just in case the request was just kicked off
            time.sleep(1)

            input_data = parse_query_string(cherrypy.request.query_string)
            return handle_get_method(input_data)
        elif 'DELETE' in cherrypy.request.method:
            input_data = parse_query_string(cherrypy.request.query_string)
            return handle_delete_method(input_data)


if __name__ == '__main__':

    # Read configuration

    config_file_path = "RestServer_config"

    if not os.path.exists(config_file_path):
        cherrypy.log('[INFO] The config file does not exist')
        sys.exit(0)

    ip = 'na'
    AnsibleServer = 'na'
    port = 'na'
    tls = False
    AUTH = False
    pub = 'na'
    priv = 'na'
    intermediate = 'na'
    timeout_seconds = 'na'
    ANSIBLE_PATH = 'na'
    ANSIBLE_TEMP = 'na'
    host = 'na'
    users = 'na'
    getresults_block = False
    from_files = False

    config_file = open(config_file_path, 'r')
    for config_line in config_file.readlines():
        if '#' not in config_line:
            if 'ip:' in config_line:
                ip = config_line.split(':')[1].strip()
            elif 'AnsibleServer:' in config_line:
                AnsibleServer = config_line.split(':')[1].strip()
            elif 'port:' in config_line:
                port = config_line.split(':')[1].strip()
            elif 'ksalt:' in config_line:
                salt = config_line.split(':')[1].strip()
            elif 'tls:' in config_line:
                tls = 'YES' in config_line.split(':')[1].strip().upper()
            elif 'auth:' in config_line:
                AUTH = 'YES' in config_line.split(':')[1].strip().upper()
            if tls and 'priv:' in config_line:
                priv = config_line.split(':')[1].strip()
            if tls and 'pub:' in config_line:
                pub = config_line.split(':')[1].strip()
            if tls and 'inter_cert:' in config_line:
                intermediate = config_line.split(':')[1].strip()
            if 'timeout_seconds' in config_line:
                timeout_seconds = int(config_line.split(':')[1].strip())
            if 'ansible_path' in config_line:
                ANSIBLE_PATH = config_line.split(':')[1].strip()
            if 'ansible_inv' in config_line:
                ANSIBLE_INV = config_line.split(':')[1].strip()
                if not os.path.exists(ANSIBLE_PATH + "/" + ANSIBLE_INV):
                    print('[INFO] The ansible_inv file does not exist')
                    sys.exit(0)
            if 'ansible_temp' in config_line:
                ANSIBLE_TEMP = config_line.split(':')[1].strip()
            if 'host' in config_line:
                host = config_line.split(':')[1].strip()
            if 'users' in config_line:
                users = config_line.split(':')[1].strip()
            if 'getresults_block' in config_line:
                getresults_block = 'YES' in config_line.split(':')[1].strip().upper()
            if 'from_files' in config_line:
                from_files = 'YES' in config_line.split(':')[1].strip().upper()
    config_file.close()

    # Initialization

    global_conf = {
        'global': {
            'log.screen': True,
            'response.timeout': 5400,
            'server.socket_host': ip,
            'server.socket_port': int(port),
            'server.protocol_version': 'HTTP/1.1'
        }
    }

    if tls:
        # Use pythons built-in SSL
        cherrypy.server.ssl_module = 'builtin'

        # Point to certificate files

        if not os.path.exists(pub):
            cherrypy.log('[INFO] The public certificate does not exist')
            sys.exit(0)

        if not os.path.exists(priv):
            cherrypy.log('[INFO] The private key does not exist')
            sys.exit(0)

        if not os.path.exists(intermediate):
            cherrypy.log('[INFO] The intermediate certificate does not exist')
            sys.exit(0)

        cherrypy.server.ssl_certificate = pub
        cherrypy.server.ssl_certificate_chain = intermediate
        cherrypy.server.ssl_private_key = priv

    if AUTH:
        # Read in and build user dictionary
        if not os.path.exists(users):
            cherrypy.log('[INFO] The users file does not exist: ' + users)
            sys.exit(0)
        userpassdict = {}
        user_file = open(users, 'r')
        for config_line in user_file.readlines():
            if '#' not in config_line:
                uid = config_line.split(':')[0].strip()
                pw = config_line.split(':')[1].strip()
                userpassdict[uid] = pw

        app_conf = {
            '/':
                {'tools.auth_basic.on': True,
                 'tools.auth_basic.realm': 'earth',
                 'tools.auth_basic.checkpassword': validate_password
                 }
        }

        application = cherrypy.tree.mount(TestManager(), '/', app_conf)
    else:
        application = cherrypy.tree.mount(TestManager(), '/')

    cherrypy.config.update({
        'log.access_file': "/var/log/RestServer.access"
    })
    accessLogName = "/var/log/RestServer.access"
    applicationLogName = "/var/log/RestServer.log"
    cherrypy.config.update(global_conf)

    log = application.log
    log.error_file = ""
    log.access_file = ""
    from logging import handlers

    applicationLogFileHandler = handlers.RotatingFileHandler(applicationLogName, 'a', 1000000, 5000)
    accessLogFileHandler = handlers.RotatingFileHandler(accessLogName, 'a', 1000000, 5000)
    import logging

    applicationLogFileHandler.setLevel(logging.DEBUG)
    log.error_log.addHandler(applicationLogFileHandler)
    log.access_log.addHandler(accessLogFileHandler)

    # Start server

    cherrypy.engine.start()
    cherrypy.engine.block()
