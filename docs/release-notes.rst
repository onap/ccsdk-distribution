.. This work is licensed under a Creative Commons Attribution 4.0
   International License.
.. http://creativecommons.org/licenses/by/4.0
.. (c) ONAP Project and its contributors
.. _release_notes:

*******************
CCSDK Release Notes
*******************


Abstract
========

This document provides the release notes for the Honolulu maintenance release of the Common Controller Software
Development Kit (CCSDK).

Summary
=======

The Honolulu release of CCSDK introduces new functionality to support network slicing and extends support
for ORAN integration via the A1 interface.  It also includes a major OpenDaylight release
upgrade (to Aluminum).

The Honolulu maintenance release includes a service release update to OpenDaylight Aluminum, and several bug fixes.


Release Data
============

+-------------------------+-------------------------------------------+
| **Project**             | CCSDK                                     |
|                         |                                           |
+-------------------------+-------------------------------------------+
| **Docker images**       | See :ref:`dockercontainers` section below |
+-------------------------+-------------------------------------------+
| **Release designation** | Honolulu maintenance release              |
|                         |                                           |
+-------------------------+-------------------------------------------+


New features
------------

The CCSDK Honolulu release includes the following features:

* Upgrade to OpenDaylight Aluminum release (Jira `CCSDK-2982 <https://jira.onap.org/browse/CCSDK-2982>`_)
* Decouple CCSDK from OpenDaylight / Karaf : phase 3 (Jira `CCSDK-2987 <https://jira.onap.org/browse/CCSDK-2987>`_)
* A1 Adapter and A1 Policy Management Extension - CCSDK (Jira `CCSDK-2991 <https://jira.onap.org/browse/CCSDK-2991>`_)
* CCSDK support of Network Slicing in Honolulu (Jira `CCSDK-2988 <https://jira.onap.org/browse/CCSDK-2988>`_)
* Native CNF Day-2 operations support (Jira `CCSDK-2922 <https://jira.onap.org/browse/CCSDK-2922>`_)

The CCSDK Honululu maintenance release includes the following features:

* Update to Aluminum SR3 (Jira `CCSDK-1542 <https://jira.onap.org/browse/CCSDK-1542>`)


For the complete list of `CCSDK Honolulu release epics <https://jira.onap.org/issues/?filter=12493>`_ and
`CCSDK Honolulu release user stories <https://jira.onap.org/issues/?filter=12494>`_ , please see the `ONAP Jira`_.

**Bug fixes**

The Honolulu maintenance release contains the following bug fixes:

* Dashboard fails readiness check (Jira `CCSDK-3233 <https://jira.onap.org/browse/CCSDK-3233>`)
* ODLUX GUI unusable in Honululu (Jira `CCSDK-3312 <https://jira.onap.org/browse/CCSDK-3312>`)
* RanSlice DG-Integration Testing fixes (Jira `CCSDK-3314 <https://jira.onap.org/browse/CCSDK-3314>`)
* CDS:when testing Scaleout, error in resource Assignment due to policy not found (Jira `CCSDK-3319 <https://jira.onap.org/browse/CCSDK-3319>`)
* Renaming BluePrint* classes caused breaking API changes (Jira `CCSDK-3385 <https://jira.onap.org/browse/CCSDK-3385>`)

The full list of `bugs fixed in the CCSDK Honolulu release <https://jira.onap.org/issues/?filter=12495>`_ is maintained on the `ONAP Jira`_.

**Known Issues**

The full list of `known issues in CCSDK <https://jira.onap.org/issues/?filter=11341>`_ is maintained on the `ONAP Jira`_.

Deliverables
------------

Software Deliverables
~~~~~~~~~~~~~~~~~~~~~

.. _dockercontainers:

Docker Containers
`````````````````

The following table lists the docker containers comprising the CCSDK Guilin
release along with the current stable Guilin version/tag.  Each of these is
available on the ONAP nexus3 site (https://nexus3.onap.org) and can be downloaded
with the following command::

   docker pull nexus3.onap.org:10001/{image-name}:{version}


Note: users that want to use the latest in-development Guilin version may use the
tag 1.0-STAGING-latest to pull the latest daily Guilin build

+---------------------------------------+--------------------------------------------+---------+
| Image name                            | Description                                | Version |
+=======================================+============================================+=========+
| onap/ccsdk-alpine-j11-image           | Base Alpine Linux image for CCSDK          | 1.1.6   |
+---------------------------------------+--------------------------------------------+---------+
| onap/ccsdk-ansible-server-image       | Ansible server image                       | 1.1.6   |
+---------------------------------------+--------------------------------------------+---------+
| onap/ccsdk-apps-ms-neng               | Naming microservice                        | 1.1.1   |
+---------------------------------------+--------------------------------------------+---------+
| onap/ccsdk-blueprints-processor       | CDS blueprint processor                    | 1.1.5   |
+---------------------------------------+--------------------------------------------+---------+
| onap/ccsdk-cds-ui-server              | CDS user interface back end                | 1.1.5   |
+---------------------------------------+--------------------------------------------+---------+
| onap/ccsdk-commandexecutor            | CDS command executor                       | 1.1.5   |
+---------------------------------------+--------------------------------------------+---------+
| onap/ccsdk-controllerblueprint        | CDS controller blueprints                  | 1.1.5   |
+---------------------------------------+--------------------------------------------+---------+
| onap/ccsdk-dgbuilder-image            | Directed graph builder                     | 1.1.6   |
+---------------------------------------+--------------------------------------------+---------+
| onap/ccsdk-odl-aluminum-alpine-image  | Alpine based OpenDaylight Aluminum image   | 1.1.6   |
+---------------------------------------+--------------------------------------------+---------+
| onap/ccsdk-odlsli-alpine-image        | Alpine based OpenDaylight image with CCSDK | 1.1.6   |
+---------------------------------------+--------------------------------------------+---------+
| onap/ccsdk-saltstack-server-image     | Saltstack server                           | 1.1.6   |
+---------------------------------------+--------------------------------------------+---------+
| onap/ccsdk-sdclistener                | CDS SDC listener                           | 1.1.5   |
+---------------------------------------+--------------------------------------------+---------+
| onap/ccsdk-ubuntu-image               | Base Ubuntu image for CCSDK                | 1.1.6   |
+---------------------------------------+--------------------------------------------+---------+

Maven Artifacts
```````````````
In addition to docker containers, CCSDK also provides libraries that are intended to be used by
client applications (e.g. APPC, SDNC) as maven dependencies.


ccsdk/parent
^^^^^^^^^^^^
Many CCSDK clients need to be able to inherit settings from third party parent poms provided
by OpenDaylight or springboot, and therefore are unable to use the standard ONAP parent pom.
The CCSDK parent repository provides its own version of parent poms whose contents are consistent
with ONAP standard settings (as defined in oparent), but whose parent is the OpenDaylight or
springboot parent, so that clients can effectively merge both sets of settings.

The following table lists the parent poms provided by CCSDK and the current stable
Frankfurt version of each.

+-----------------------+------------------------------+---------+--------------------------------------------------------------------------------------------------+
| groupId               | artifactId                   | version | Description                                                                                      |
+=======================+==============================+=========+==================================================================================================+
| org.onap.ccsdk.parent | binding-parent               | 2.1.8   | Parent used in place of OpenDaylight binding-parent                                              |
+-----------------------+------------------------------+---------+--------------------------------------------------------------------------------------------------+
| org.onap.ccsdk.parent | bundle-parent                | 2.1.8   | Parent used in place of OpenDaylight bundle-parent                                               |
+-----------------------+------------------------------+---------+--------------------------------------------------------------------------------------------------+
| org.onap.ccsdk.parent | client-parent                | 2.1.8   | Parent used for projects that create client libraries for OpenDaylight APIs                      |
+-----------------------+------------------------------+---------+--------------------------------------------------------------------------------------------------+
| org.onap.ccsdk.parent | dependencies-bom             | 2.1.8   | Bill of Materials POM that defines versions of third party libraries used outside ODL container. |
|                       |                              |         | Intended to be imported in dependencyManagement section.                                         |
+-----------------------+------------------------------+---------+--------------------------------------------------------------------------------------------------+
| org.onap.ccsdk.parent | dependencies-odl-bom         | 2.1.8   | Bill of Materials POM that defines versions of third party libraries used within ODL container.  |
|                       |                              |         | Intended to be imported in dependencyManagement section.                                         |
+-----------------------+------------------------------+---------+--------------------------------------------------------------------------------------------------+
| org.onap.ccsdk.parent | feature-repo-parent          | 2.1.8   | Parent used in place of OpenDaylight feature-repo-parent                                         |
+-----------------------+------------------------------+---------+--------------------------------------------------------------------------------------------------+
| org.onap.ccsdk.parent | karaf4-parent                | 2.1.8   | Parent used in place of OpenDaylight karaf4-parent                                               |
+-----------------------+------------------------------+---------+--------------------------------------------------------------------------------------------------+
| org.onap.ccsdk.parent | mdsal-it-parent              | 2.1.8   | Parent used in place of OpenDaylight mdsal-it-parent                                             |
+-----------------------+------------------------------+---------+--------------------------------------------------------------------------------------------------+
| org.onap.ccsdk.parent | odlparent                    | 2.1.8   | Parent used in place of OpenDaylight odlparent                                                   |
+-----------------------+------------------------------+---------+--------------------------------------------------------------------------------------------------+
| org.onap.ccsdk.parent | odlparent-lite               | 2.1.8   | Parent used in place of OpenDaylight odlparent-lite                                              |
+-----------------------+------------------------------+---------+--------------------------------------------------------------------------------------------------+
| org.onap.ccsdk.parent | single-feature-parent        | 2.1.8   | Parent used in place of OpenDaylight single-feature-parent                                       |
+-----------------------+------------------------------+---------+--------------------------------------------------------------------------------------------------+
| org.onap.ccsdk.parent | spring-boot-1-starter-parent | 2.1.8   | Parent used in place of spring-boot-starter-parent for Springboot 1.x.                           |
|                       |                              |         | *NOTE* This is deprecated and will be removed in Honolulu, since springboot 1.x should no        |
|                       |                              |         | longer be used due to security issues                                                            |
+-----------------------+------------------------------+---------+--------------------------------------------------------------------------------------------------+
| org.onap.ccsdk.parent | spring-boot-starter-parent   | 2.1.8   | Parent used in place of spring-boot-starter-parent for Springboot 2.x                            |
+-----------------------+------------------------------+---------+--------------------------------------------------------------------------------------------------+
| org.onap.ccsdk.parent | standalone-parent            | 2.1.8   | Parent used for projects that have no need for other third party parent poms                     |
+-----------------------+------------------------------+---------+--------------------------------------------------------------------------------------------------+

ccsdk/sli
^^^^^^^^^^^^^^
The ccsdk/sli library provides the Service Logic Interpreter (SLI), which is the engine that runs directed graphs.  It also
provides a number of libraries that can be used by other CCSDK client projects.

The following table lists the maven artifacts provided for use by CCSDK client
projects.

+-------------------------------+------------------------------+---------+--------------------------------------------+
| groupId                       | artifactId                   | version | Description                                |
+===============================+==============================+=========+============================================+
| org.onap.ccsdk.sli.core       | dblib-provider               | 1.2.4   | Database access library                    |
+-------------------------------+------------------------------+---------+--------------------------------------------+
| org.onap.ccsdk.sli.core       | sli-common                   | 1.2.4   | Common SLI data objects                    |
+-------------------------------+------------------------------+---------+--------------------------------------------+
| org.onap.ccsdk.sli.core       | sli-provider-base            | 1.2.4   | ODL-independent SLI implementation objects |
+-------------------------------+------------------------------+---------+--------------------------------------------+
| org.onap.ccsdk.sli.core       | sli-provider                 | 1.2.4   | ODL-dependent SLI implementation objects   |
+-------------------------------+------------------------------+---------+--------------------------------------------+
| org.onap.ccsdk.sli.core       | sliPluginUtils-provider      | 1.2.4   | Utilities for use in SLI adaptors/plugins  |
+-------------------------------+------------------------------+---------+--------------------------------------------+
| org.onap.ccsdk.sli.core       | utils-provider               | 1.2.4   | Utilities                                  |
+-------------------------------+------------------------------+---------+--------------------------------------------+
| org.onap.ccsdk.sli.adaptors   | aai-service-provider         | 1.2.4   | A&AI interface adaptor                     |
+-------------------------------+------------------------------+---------+--------------------------------------------+
| org.onap.ccsdk.sli.adaptors   | ansible-adapter-bundle       | 1.2.4   | Ansible interface adaptor                  |
+-------------------------------+------------------------------+---------+--------------------------------------------+
| org.onap.ccsdk.sli.adaptors   | mdsal-resource-provider      | 1.2.4   | MD-SAL interface adaptor                   |
+-------------------------------+------------------------------+---------+--------------------------------------------+
| org.onap.ccsdk.sli.adaptors   | netbox-client-provider       | 1.2.4   | netbox interface adaptor                   |
+-------------------------------+------------------------------+---------+--------------------------------------------+
| org.onap.ccsdk.sli.adaptors   | resource-assignment-provider | 1.2.4   | resource allocator                         |
+-------------------------------+------------------------------+---------+--------------------------------------------+
| org.onap.ccsdk.sli.adaptors   | saltstack-adaptor-provider   | 1.2.4   | saltstack interface adaptor                |
+-------------------------------+------------------------------+---------+--------------------------------------------+
| org.onap.ccsdk.sli.adaptors   | sql-resource-provider        | 1.2.4   | SQL database interface adaptor             |
+-------------------------------+------------------------------+---------+--------------------------------------------+
| org.onap.ccsdk.sli.northbound | asdcApi-provider             | 1.2.4   | ODL-based SDC interface                    |
+-------------------------------+------------------------------+---------+--------------------------------------------+
| org.onap.ccsdk.sli.northbound | dataChange-provider          | 1.2.4   | A&AI data change notification interface    |
+-------------------------------+------------------------------+---------+--------------------------------------------+
| org.onap.ccsdk.sli.northbound | dmaap-listener               | 1.2.4   | DMaaP listener interface                   |
+-------------------------------+------------------------------+---------+--------------------------------------------+
| org.onap.ccsdk.sli.northbound | lcm-provider                 | 1.2.4   | Life Cycle Management event interface      |
+-------------------------------+------------------------------+---------+--------------------------------------------+
| org.onap.ccsdk.sli.northbound | ueb-listener                 | 1.2.4   | SDC event listener                         |
+-------------------------------+------------------------------+---------+--------------------------------------------+
| org.onap.ccsdk.sli.plugins    | properties-node-provider     | 1.2.4   | Used to load a properties file for use in  |
|                               |                              |         | a directed graph                           |
+-------------------------------+------------------------------+---------+--------------------------------------------+
| org.onap.ccsdk.sli.plugins    | restapi-call-node-provider   | 1.2.4   | Used to call a generic REST API from a     |
|                               |                              |         | directed graph                             |
+-------------------------------+------------------------------+---------+--------------------------------------------+
| org.onap.ccsdk.sli.plugins    | restconf-client-provider     | 1.2.4   | Used to call a RESTCONF API from a         |
|                               |                              |         | directed graph                             |
+-------------------------------+------------------------------+---------+--------------------------------------------+
| org.onap.ccsdk.sli.plugins    | sshapi-call-node             | 1.2.4   | Used to invoke an SSH interface from a     |
|                               |                              |         | directed graph                             |
+-------------------------------+------------------------------+---------+--------------------------------------------+
| org.onap.ccsdk.sli.plugins    | template-node-provider       | 1.2.4   | Provides velocity template support         |
+-------------------------------+------------------------------+---------+--------------------------------------------+

Documentation Deliverables
~~~~~~~~~~~~~~~~~~~~~~~~~~
* `CDS user guide`_
* `SDN Controller for Radio user guide`_

Known Limitations, Issues and Workarounds
=========================================

System Limitations
------------------

No system limitations noted.


Known Vulnerabilities
---------------------

Any known vulnerabilities for ONAP are tracked in the `ONAP Jira`_ in the OJSI project.  Any outstanding OJSI issues that
pertain to CCSDK are listed in the :ref:`secissues` section below.


Workarounds
-----------

Not applicable.


Security Notes
--------------

Fixed Security Issues
~~~~~~~~~~~~~~~~~~~~~

There are no new security fixes in the Guilin release.

.. _secissues :

Known Security Issues
~~~~~~~~~~~~~~~~~~~~~

There is currently only one known CCSDK security issue, related to a third party application (netbox) that CCSDK uses:

* `OJSI-160 <https://jira.onap.org/browse/OJSI-160>`_ : netbox-nginx exposes plain text HTTP endpoint using port 30420



Test Results
============
Not applicable


References
==========

For more information on the ONAP Frankfurt release, please see:

#. `ONAP Home Page`_
#. `ONAP Documentation`_
#. `ONAP Release Downloads`_
#. `ONAP Wiki Page`_


.. _`ONAP Home Page`: https://www.onap.org
.. _`ONAP Wiki Page`: https://wiki.onap.org
.. _`ONAP Documentation`: https://docs.onap.org
.. _`ONAP Release Downloads`: https://git.onap.org
.. _`ONAP Jira`: https://jira.onap.org
.. _`CDS user guide`: https://docs.onap.org/en/frankfurt/submodules/ccsdk/cds.git/docs/index.html
.. _`SDN Controller for Radio user guide`: https://docs.onap.org/en/frankfurt/submodules/ccsdk/features.git/docs/guides/onap-user/home.html