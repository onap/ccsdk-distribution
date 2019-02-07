.. This work is licensed under a Creative Commons Attribution 4.0 International License.

Release Notes
#############

Version: 0.3.3
**************

:Release Date: 2019-01-30

** Bug Fixes **
The following bugs are fixed in the CCSDK Casablanca January 2019 maintenance release:

+-------------+-------------------------------------------------------------------------------+
| Jira #      | Abstract                                                                      |
+=============+===============================================================================+
| [CCSDK-727] | Do not prepend "sub" for subnet net id                                        |
+-------------+-------------------------------------------------------------------------------+
| [CCSDK-728] | Self serve DG adjustement for unassign                                        |
+-------------+-------------------------------------------------------------------------------+
| [CCSDK-740] | Restore inventory-response-item definition to the original version            |
+-------------+-------------------------------------------------------------------------------+
| [CCSDK-765] | Upgrade jackson version to 2.8.9                                              |
+-------------+-------------------------------------------------------------------------------+
| [CCSDK-777] | Release version contains some snapshots                                       |
+-------------+-------------------------------------------------------------------------------+
| [CCSDK-843] | Compile error due to old snapshot dependency                                  |
+-------------+-------------------------------------------------------------------------------+
| [CCSDK-935] | restapicall JsonParser failed if response contains : as part of response body |
+-------------+-------------------------------------------------------------------------------+

**Known Issues**
The full list of known issues in CCSDK may be found in the ONAP Jira at <https://jira.onap.org/issues/?filter=11341>

Quick Links:
   - `CCSDK project page <https://wiki.onap.org/display/DW/Common+Controller+SDK+Project>`_
   
   - `Passing Badge information for CCSDK <https://bestpractices.coreinfrastructure.org/en/projects/1630>`_
   
   - `Project Vulnerability Review Table for CCSDK <https://wiki.onap.org/pages/viewpage.action?pageId=45300857>`_

Version: 0.3.2
**************

:Release Date: 2018-11-30

**New Features**

The full list of Casablanca epics and user stories for CCSDK maybe be found at <https://jira.onap.org/issues/?filter=11516>.

The following list summarizes some of the most significant epics:

+-------------+------------------------------------------------+
| Jira #      | Abstract                                       |
+=============+================================================+
| [CCSDK-279] | Update to OpenDaylight Oxygen release          |
+-------------+------------------------------------------------+
| [CCSDK-357] | Develop Controller Design Studio in Casablanca |
+-------------+------------------------------------------------+
| [CCSDK-324] | Enhancements to support CCVPN use case         |
+-------------+------------------------------------------------+
| [CCSDK-288] | Usability Enhancements                         |
+-------------+------------------------------------------------+

**Bug Fixes**
The full list of bug fixes in the CCSDK Casablanca release may be found at <https://jira.onap.org/issues/?filter=11544>

**Known Issues**
The full list of known issues in CCSDK may be found in the ONAP Jira at <https://jira.onap.org/issues/?filter=11341>

Quick Links:
 	- `CCSDK project page <https://wiki.onap.org/display/DW/Common+Controller+SDK+Project>`_
 	
 	- `Passing Badge information for CCSDK <https://bestpractices.coreinfrastructure.org/en/projects/1630>`_
 	
 	- `Project Vulnerability Review Table for CCSDK <https://wiki.onap.org/pages/viewpage.action?pageId=45300857>`_

Version: 0.2.4
**************


:Release Date: 2018-06-07



**New Features**

The full list of Beijing Epics and user stories for CCSDK may be found at <https://jira.onap.org/issues/?filter=10792>.  The following
list summarizes some of the more critical features:

+--------------+-----------------------------------------------------------------------------------------------+
| Jira #       | Abstract                                                                                      |
+==============+===============================================================================================+
| [CCSDK-222]  | Ansible server support <https://jira.onap.org/browse/CCSDK-222>                               |
+--------------+-----------------------------------------------------------------------------------------------+
| [CCSDK-191]  | enable fast loading of graphs <https://jira.onap.org/browse/CCSDK-191>                        |
+--------------+-----------------------------------------------------------------------------------------------+
| [CCSDK-179]  | Upgrade CCSDK ODL containers to Nitrogen <https://jira.onap.org/browse/CCSDK-179>             |
+--------------+-----------------------------------------------------------------------------------------------+
| [CCSDK-177]  | Upgrade sli/northbound to Nitrogen <https://jira.onap.org/browse/CCSDK-177>                   |
+--------------+-----------------------------------------------------------------------------------------------+
| [CCSDK-176]  | Upgrade sli/adaptors to Nitrogen <https://jira.onap.org/browse/CCSDK-176>                     |
+--------------+-----------------------------------------------------------------------------------------------+
| [CCSDK-175]  | Upgrade sli/core to Nitrogen <https://jira.onap.org/browse/CCSDK-175>                         |
+--------------+-----------------------------------------------------------------------------------------------+
| [CCSDK-174]  | Update ccsdk parent to support Nitrogen parent poms <https://jira.onap.org/browse/CCSDK-174>  |
+--------------+-----------------------------------------------------------------------------------------------+
| [CCSDK-172]  | Ability to call Ansible playbook from directed graph <https://jira.onap.org/browse/CCSDK-172> |
+--------------+-----------------------------------------------------------------------------------------------+

**Bug Fixes**

The full list of bug fixes in the CCSDK Beijing release may be found at <https://jira.onap.org/issues/?filter=11117>

**Known Issues**

+--------------+-----------------------------------------------------------------------------------------------------+
| Jira #       | Abstract                                                                                            |
+==============+=====================================================================================================+
| [CCSDK-136]  | pgaas is dependent on location\_prefix being all lowercase <https://jira.onap.org/browse/CCSDK-136> |
+--------------+-----------------------------------------------------------------------------------------------------+

**Security Notes**

CCSDK code has been formally scanned during build time using NexusIQ and all Critical vulnerabilities have been addressed, items that remain open have been assessed for risk and determined to be false positive. The CCSDK open Critical security vulnerabilities and their risk assessment have been documented as part of the `project <https://wiki.onap.org/pages/viewpage.action?pageId=28379011>`_.

Quick Links:
 	- `CCSDK project page <https://wiki.onap.org/display/DW/Common+Controller+SDK+Project>`_
 	
 	- `Passing Badge information for CCSDK <https://bestpractices.coreinfrastructure.org/en/projects/1630>`_
 	
 	- `Project Vulnerability Review Table for CCSDK <https://wiki.onap.org/pages/viewpage.action?pageId=28379011>`_

**Upgrade Notes**

N/A

**Deprecation Notes**

N/A

**Other**

N/A


Version: 0.1.0
**************


:Release Date: 2017-11-16



**New Features**

The Common Controller SDK provides the following functionality :
   - Service Logic Interpreter
   - Database access library (dblib)
   - Service Logic test api (sliapi)
   - MD-SAL data query adaptor
   - SQL query adaptor
   - Resource allocator
   - SDC interface
   - DMAAP interface
   - REST API adaptor


**Bug Fixes**

**Known Issues**
   - `CCSDK-110 <https://jira.onap.org/browse/CCSDK-110>`_ Resolve license issues in dashboard project
   - `CCSDK-136 <https://jira.onap.org/browse/CCSDK-136>`_ pgaas is dependent on location_prefix being all lowercase
   - `CCSDK-137 <https://jira.onap.org/browse/CCSDK-137>`_ isolate deprecated methods

**Security Issues**
   You may want to include a reference to CVE (Common Vulnerabilities and Exposures) `CVE <https://cve.mitre.org>`_


**Upgrade Notes**

**Deprecation Notes**

**Other**

