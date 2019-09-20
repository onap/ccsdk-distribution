.. This work is licensed under a Creative Commons Attribution 4.0 International License.

Release Notes
#############

Version 0.5.4 / 0.6.3
*********************
:Release Date: 2019-09-30

El Alto release

**Artifact Versions**

The CCSDK El Alto release includes artifacts for both OpenDaylight Fluorine SR2 (version 0.5.4) and
OpenDaylight Neon SR1 (version 0.6.3).

Note: CCSDK support for Ubuntu-based OpenDaylight containers is deprecated.  Ubuntu-based containers are provided
for ODL Fluorine, but not for Neon.

The following table lists the CCSDK docker containers and their versions.

+--------------------------------------+---------------------------------------------------+----------------------+
| Image name                           |  Description                                      | Version(s)           |
+======================================+===================================================+======================+
| onap/ccsdk-alpine-image              | Base Alpine Linux image for CCSDK                 | 0.5.3 (ODL Fluorine) |
|                                      |                                                   | 0.6.2 (ODL Neon)     |
+--------------------------------------+---------------------------------------------------+----------------------+
| onap/ccsdk-ansible-server-image      | Ansible server image                              | 0.5.3 (ODL Fluorine) |
|                                      |                                                   | 0.6.2 (ODL Neon)     |
+--------------------------------------+---------------------------------------------------+----------------------+
| onap/ccsdk-apps-ms-neng              | Naming microservice                               | 0.6.2                |
+--------------------------------------+---------------------------------------------------+----------------------+
| onap/ccsdk-blueprints-processor      | CDS blueprint processor                           | 0.6.2                |
+--------------------------------------+---------------------------------------------------+----------------------+
| onap/ccsdk-cds-ui                    | CDS web interface                                 | 0.6.2                |
+--------------------------------------+---------------------------------------------------+----------------------+
| onap/ccsdk-cds-ui-server             | CDS user interface back end                       | 0.6.2                |
+--------------------------------------+---------------------------------------------------+----------------------+
| onap/ccsdk-commandexecutor           | CDS command executor                              | 0.6.2                |
+--------------------------------------+---------------------------------------------------+----------------------+
| onap/ccsdk-controllerblueprint       | CDS controller blueprints                         | 0.6.2                |
+--------------------------------------+---------------------------------------------------+----------------------+
| onap/ccsdk-dgbuilder-image           | Directed graph builder                            | 0.5.3 (ODL Fluorine) |
|                                      |                                                   | 0.6.2 (ODL Neon)     |
+--------------------------------------+---------------------------------------------------+----------------------+
| onap/ccsdk-odl-fluorine-alpine-image | Alpine based OpenDaylight Fluorine SR2 image      | 0.5.3                |
+--------------------------------------+---------------------------------------------------+----------------------+
| onap/ccsdk-odl-fluorine-ubuntu-image | Ubuntu based OpenDaylight Fluorine SR2 image      | 0.5.3                |
+--------------------------------------+---------------------------------------------------+----------------------+
| onap/ccsdk-odl-neon-alpine-image     | Alpine based OpenDaylight Neon SR1 image          | 0.6.2                |
+--------------------------------------+---------------------------------------------------+----------------------+
| onap/ccsdk-odlsli-alpine-image       | Alpine based OpenDaylight image with CCSDK        | 0.5.3 (ODL Fluorine) |
|                                      | libraries installed                               | 0.6.2 (ODL Neon)     |
+--------------------------------------+---------------------------------------------------+----------------------+
| onap/ccsdk-odlsli-image              | Ubuntu based OpenDaylight image with CCSDK        | 0.5.3 (ODL Fluorine) |
|                                      | libraries installed. DEPRECATED (see note above)  |                      |
+--------------------------------------+---------------------------------------------------+----------------------+
| onap/ccsdk-saltstack-server-image    | Saltstack server                                  | 0.5.3 (ODL Fluorine) |
|                                      |                                                   | 0.6.2 (ODL Neon)     |
+--------------------------------------+---------------------------------------------------+----------------------+
| onap/ccsdk-sdclistener               | CDS SDC listener                                  | 0.6.2                |
+--------------------------------------+---------------------------------------------------+----------------------+
| onap/ccsdk-ubuntu-image              | Base Ubuntu image for CCSDK                       | 0.5.3                |
|                                      |                                                   | 0.6.2                |
+--------------------------------------+---------------------------------------------------+----------------------+

**New Features**

There are no new use cases or functional requirements in the El Alto release.  The focus of this release is on bug
fixes, with a particular emphasis fon security fixes.  However, there are new non-functional user stories that were
in El Alto.

The full list of CCSDK user stories for El Alto may be found at <https://jira.onap.org/issues/?filter=12041>.

The following table lists some of the most significant user stories:

+--------------+----------------------------------------------------+
| Jira #       | Abstract                                           |
+==============+====================================================+
| CCSDK-1387   | Upgrade to OpenDaylight Neon SR1                   |
+--------------+----------------------------------------------------+
| CCSDK-1033   | Support for NETCONF Notifications in CCSDK/SDNC    |
+--------------+----------------------------------------------------+


**Bug Fixes**
The full list of bug fixes in the El Alto release may be found at <https://jira.onap.org/issues/?filter=12018>

The following table summarizes some of the most significant issues addressed:

+--------------+----------------------------------------------------+
| Jira #       | Abstract                                           |
+==============+====================================================+
| [CCSDK-1445] | loading jdbc driver Exception in ccsdk             |
+--------------+----------------------------------------------------+
| [CCSDK-1443] | cds blueprint processor does not start             |
+--------------+----------------------------------------------------+
| [CCSDK-1240] | CVE-20190-3795 : spring-data-core vulnerability    |
+--------------+----------------------------------------------------+
| [CCSDK-1239] | CVE-2019-3797 : spring-data vulnerability          |
+--------------+----------------------------------------------------+
| [CCSDK-1238] | Multiple CVEs - commons-compress                   |
+--------------+----------------------------------------------------+
| [CCSDK-1117] | Remove runtime internet dependency for dgbuilder   |
+--------------+----------------------------------------------------+
| [CCSDK-991]  | Upgrade to spring-core 2.8.6 or higher             |
+--------------+----------------------------------------------------+
| [CCSDK-988]  | Multiple CVEs - spring-expression < 4.3.17.RELEASE |
+--------------+----------------------------------------------------+
| [CCSDK-441]  | Spring 3 vulnerability CVE-2018-1270               |
+--------------+----------------------------------------------------+
**Known Issues**

The full list of known issues in CCSDK may be found in the ONAP Jira at <https://jira.onap.org/issues/?filter=11341>

**Security Notes**

*Fixed Security Issues*

*Known Security Issues*

        * In default deployment CCSDK (netbox-nginx) exposes HTTP port 30420 outside of cluster. [`OJSI-160 <https://jira.onap.org/browse/OJSI-160>`_]
        * In default deployment CCSDK (cds-ui) exposes HTTP port 30497 outside of cluster. [`OJSI-196 <https://jira.onap.org/browse/OJSI-196>`_]
        * In default deployment CCSDK (cds-blueprints-processor-http) exposes HTTP port 30499 outside of cluster. [`OJSI-197 <https://jira.onap.org/browse/OJSI-197>`_]

*Known Vulnerabilities in Used Modules*

Quick Links:
 	- `CCSDK project page <https://wiki.onap.org/display/DW/Common+Controller+SDK+Project>`_

 	- `Passing Badge information for CCSDK <https://bestpractices.coreinfrastructure.org/en/projects/1630>`_

 	- `Project Vulnerability Review Table for CCSDK <https://wiki.onap.org/pages/viewpage.action?pageId=51282469>`_


Version 0.4.4/0.4.5
*******************
:Release Date: 2019-06-13

Note: The Dublin version for most CCSDK repositories is 0.4.4, except for CDS which is version
0.4.5

**New Features**

The full list of Dublin epics and user stories for CCSDK may be found at <https://jira.onap.org/issues/?filter=11802>.

The following list summarizes some of the most significant epics:

+-------------+------------------------------------------------+
| Jira #      | Abstract                                       |
+=============+================================================+
| [CCSDK-575] | Improve E2E Process Automation                 |
+-------------+------------------------------------------------+
| [CCSDK-840] | S3P - Footprint Optimization                   |
+-------------+------------------------------------------------+
| [CCSDK-859] | Update to OpenDaylight Fluorine                |
+-------------+------------------------------------------------+
| [CCSDK-929] | 5G Use Case                                    |
+-------------+------------------------------------------------+
| [CCSDK-930] | CCVPN Use Case Extension                       |
+-------------+------------------------------------------------+


**Bug Fixes**
The full list of bug fixes in the CCSDK Dublin release may be found at <https://jira.onap.org/issues/?filter=11804>

**Known Issues**
The full list of known issues in CCSDK may be found in the ONAP Jira at <https://jira.onap.org/issues/?filter=11341>

**Security Notes**

*Fixed Security Issues*

*Known Security Issues*

        * In default deployment CCSDK (netbox-nginx) exposes HTTP port 30420 outside of cluster. [`OJSI-160 <https://jira.onap.org/browse/OJSI-160>`_]
        * In default deployment CCSDK (cds-ui) exposes HTTP port 30497 outside of cluster. [`OJSI-196 <https://jira.onap.org/browse/OJSI-196>`_]
        * In default deployment CCSDK (cds-blueprints-processor-http) exposes HTTP port 30499 outside of cluster. [`OJSI-197 <https://jira.onap.org/browse/OJSI-197>`_]

*Known Vulnerabilities in Used Modules*

Quick Links:
 	- `CCSDK project page <https://wiki.onap.org/display/DW/Common+Controller+SDK+Project>`_

 	- `Passing Badge information for CCSDK <https://bestpractices.coreinfrastructure.org/en/projects/1630>`_

 	- `Project Vulnerability Review Table for CCSDK <https://wiki.onap.org/pages/viewpage.action?pageId=51282469>`_

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
