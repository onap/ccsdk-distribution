.. This work is licensed under a Creative Commons Attribution 4.0
   International License.
.. http://creativecommons.org/licenses/by/4.0
.. (c) ONAP Project and its contributors
.. _release_notes:

*******************
CCSDK Release Notes
*******************

Frankfurt Maintenance Release 1
********************************

Release Data
============

+-------------------------+---------------------------------------------------+
| **Project**             | CCSDK                                             |
|                         |                                                   |
+-------------------------+---------------------------------------------------+
| **Docker images**       | See :ref:`dockercontainersmtcerel1` section below |
+-------------------------+---------------------------------------------------+
| **Release designation** | Frankfurt Maintenance Release 1                   |
|                         |                                                   |
+-------------------------+---------------------------------------------------+
| **Release date**        | 08/17/2020                                        |
|                         |                                                   |
+-------------------------+---------------------------------------------------+

Bugs Fixed
==========
The following bug fix is included in Frankfurt Maintenance Release 1:

+------------+-----------------------------------------------+
| Jira #     | Abstract                                      |
+============+===============================================+
| CCSDK-2399 | restapicallnode should support commas in urls |
+------------+-----------------------------------------------+

.. _dockercontainersmtcerel1:

Docker Containers
`````````````````

The following table lists the docker containers included in the CCSDK Frankfurt 
release along with the current stable Frankfurt version/tag.  Each of these is
available on the ONAP nexus3 site (https://nexus3.onap.org) and can be downloaded
with the following command::

   docker pull nexus3.onap.org:10001/{image-name}:{version}


Note: users that want to use the latest in-development Frankfurt version may use the
tag 0.7-STAGING-latest to pull the latest daily Frankfurt build

+-----------------------------------+--------------------------------------------+---------+
| Image name                        | Description                                | Version |
+===================================+============================================+=========+
| onap/ccsdk-alpine-image           | Base Alpine Linux image for CCSDK          | 0.7.5   |
+-----------------------------------+--------------------------------------------+---------+
| onap/ccsdk-ansible-server-image   | Ansible server image                       | 0.7.5   |
+-----------------------------------+--------------------------------------------+---------+
| onap/ccsdk-dgbuilder-image        | Directed graph builder                     | 0.7.5   |
+-----------------------------------+--------------------------------------------+---------+
| onap/ccsdk-odl-neon-alpine-image  | Alpine based OpenDaylight Neon SR1 image   | 0.7.5   |
+-----------------------------------+--------------------------------------------+---------+
| onap/ccsdk-odlsli-alpine-image    | Alpine based OpenDaylight image with CCSDK | 0.7.5   |
+-----------------------------------+--------------------------------------------+---------+
| onap/ccsdk-saltstack-server-image | Saltstack server                           | 0.7.5   |
+-----------------------------------+--------------------------------------------+---------+
| onap/ccsdk-ubuntu-image           | Base Ubuntu image for CCSDK                | 0.7.5   |
+-----------------------------------+--------------------------------------------+---------+

Frankfurt Release
*****************

Abstract
========

This document provides the release notes for the Frankfurt release of the Common Controller Software
Development Kit (CCSDK).

Summary
=======

The Frankfurt release of CCSDK introduces new functionality to support PNFs (Physical Network Functions), extends support
for Netconf/TLS to support CMPv2, and extends CDS to act as an agent in self-serve control loops.


Release Data
============

+-------------------------+-------------------------------------------+
| **Project**             | CCSDK                                     |
|                         |                                           |
+-------------------------+-------------------------------------------+
| **Docker images**       | See :ref:`dockercontainers` section below |
+-------------------------+-------------------------------------------+
| **Release designation** | Frankfurt                                 |
|                         |                                           |
+-------------------------+-------------------------------------------+
| **Release date**        | 06/04/2020                                |
|                         |                                           |
+-------------------------+-------------------------------------------+


New features
------------

The CCSDK Frankfurt release includes the following features:

* First phase of OpenDaylight separation (Jira `CCSDK-8 <https://jira.onap.org/browse/CCSDK-8>`_), currently targeted for completion in Guilin
* Integration of CDS as an actor in Control loops (Jira `CCSDK-1898 <https://jira.onap.org/browse/CCSDK-1898>`_)
* ORAN-compliant A1 adaptor (Jira `CCSDK-1796 <https://jira.onap.org/browse/CCSDK-1796>`_)
* Multi-Domain Optical Service (Jira `CCSDK-1828 <https://jira.onap.org/browse/CCSDK-1828>`_)
* Python 2 -> Python 3 migration (Jira `CCSDK-1905 <https://jira.onap.org/browse/CCSDK-1905>`_)


For the complete list of `CCSDK Frankfurt release epics <https://jira.onap.org/issues/?filter=12316>`_ and 
`CCSDK Frankfurt release user stories <https://jira.onap.org/issues/?filter=12319>`_ , please see the `ONAP Jira`_.

**Bug fixes**

The full list of `bugs fixed in the CCSDK Frankfurt release <https://jira.onap.org/issues/?filter=12320>`_ is maintained on the `ONAP Jira`_.

**Known Issues**

The full list of `known issues in CCSDK <https://jira.onap.org/issues/?filter=11341>`_ is maintained on the `ONAP Jira`_.

Deliverables
------------

Software Deliverables
~~~~~~~~~~~~~~~~~~~~~

.. _dockercontainers:

Docker Containers
`````````````````

The following table lists the docker containers comprising the CCSDK Frankfurt 
release along with the current stable Frankfurt version/tag.  Each of these is
available on the ONAP nexus3 site (https://nexus3.onap.org) and can be downloaded
with the following command::

   docker pull nexus3.onap.org:10001/{image-name}:{version}


Note: users that want to use the latest in-development Frankfurt version may use the
tag 0.7-STAGING-latest to pull the latest daily Frankfurt build

+-----------------------------------+--------------------------------------------+---------+
| Image name                        | Description                                | Version |
+===================================+============================================+=========+
| onap/ccsdk-alpine-image           | Base Alpine Linux image for CCSDK          | 0.7.4   |
+-----------------------------------+--------------------------------------------+---------+
| onap/ccsdk-ansible-server-image   | Ansible server image                       | 0.7.4   |
+-----------------------------------+--------------------------------------------+---------+
| onap/ccsdk-apps-ms-neng           | Naming microservice                        | 0.7.1   |
+-----------------------------------+--------------------------------------------+---------+
| onap/ccsdk-blueprints-processor   | CDS blueprint processor                    | 0.7.5   |
+-----------------------------------+--------------------------------------------+---------+
| onap/ccsdk-cds-ui                 | CDS web interface                          | 0.7.5   |
+-----------------------------------+--------------------------------------------+---------+
| onap/ccsdk-cds-ui-server          | CDS user interface back end                | 0.7.5   |
+-----------------------------------+--------------------------------------------+---------+
| onap/ccsdk-commandexecutor        | CDS command executor                       | 0.7.5   |
+-----------------------------------+--------------------------------------------+---------+
| onap/ccsdk-controllerblueprint    | CDS controller blueprints                  | 0.7.5   |
+-----------------------------------+--------------------------------------------+---------+
| onap/ccsdk-dgbuilder-image        | Directed graph builder                     | 0.7.4   |
+-----------------------------------+--------------------------------------------+---------+
| onap/ccsdk-odl-neon-alpine-image  | Alpine based OpenDaylight Neon SR1 image   | 0.7.4   |
+-----------------------------------+--------------------------------------------+---------+
| onap/ccsdk-odlsli-alpine-image    | Alpine based OpenDaylight image with CCSDK | 0.7.4   |
+-----------------------------------+--------------------------------------------+---------+
| onap/ccsdk-saltstack-server-image | Saltstack server                           | 0.7.4   |
+-----------------------------------+--------------------------------------------+---------+
| onap/ccsdk-sdclistener            | CDS SDC listener                           | 0.7.3   |
+-----------------------------------+--------------------------------------------+---------+
| onap/ccsdk-ubuntu-image           | Base Ubuntu image for CCSDK                | 0.7.4   |
+-----------------------------------+--------------------------------------------+---------+

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
| org.onap.ccsdk.parent | binding-parent               | 1.5.7   | Parent used in place of OpenDaylight binding-parent                                              |
+-----------------------+------------------------------+---------+--------------------------------------------------------------------------------------------------+
| org.onap.ccsdk.parent | bundle-parent                | 1.5.7   | Parent used in place of OpenDaylight bundle-parent                                               |
+-----------------------+------------------------------+---------+--------------------------------------------------------------------------------------------------+
| org.onap.ccsdk.parent | client-parent                | 1.5.7   | Parent used for projects that create client libraries for OpenDaylight APIs                      |
+-----------------------+------------------------------+---------+--------------------------------------------------------------------------------------------------+
| org.onap.ccsdk.parent | dependencies-bom             | 1.5.7   | Bill of Materials POM that defines versions of third party libraries used outside ODL container. |
|                       |                              |         | Intended to be imported in dependencyManagement section.                                         |
+-----------------------+------------------------------+---------+--------------------------------------------------------------------------------------------------+
| org.onap.ccsdk.parent | dependencies-odl-bom         | 1.5.7   | Bill of Materials POM that defines versions of third party libraries used within ODL container.  |
|                       |                              |         | Intended to be imported in dependencyManagement section.                                         |
+-----------------------+------------------------------+---------+--------------------------------------------------------------------------------------------------+
| org.onap.ccsdk.parent | feature-repo-parent          | 1.5.7   | Parent used in place of OpenDaylight feature-repo-parent                                         |
+-----------------------+------------------------------+---------+--------------------------------------------------------------------------------------------------+
| org.onap.ccsdk.parent | karaf4-parent                | 1.5.7   | Parent used in place of OpenDaylight karaf4-parent                                               |
+-----------------------+------------------------------+---------+--------------------------------------------------------------------------------------------------+
| org.onap.ccsdk.parent | mdsal-it-parent              | 1.5.7   | Parent used in place of OpenDaylight mdsal-it-parent                                             |
+-----------------------+------------------------------+---------+--------------------------------------------------------------------------------------------------+
| org.onap.ccsdk.parent | odlparent                    | 1.5.7   | Parent used in place of OpenDaylight odlparent                                                   |
+-----------------------+------------------------------+---------+--------------------------------------------------------------------------------------------------+
| org.onap.ccsdk.parent | odlparent-lite               | 1.5.7   | Parent used in place of OpenDaylight odlparent-lite                                              |
+-----------------------+------------------------------+---------+--------------------------------------------------------------------------------------------------+
| org.onap.ccsdk.parent | single-feature-parent        | 1.5.7   | Parent used in place of OpenDaylight single-feature-parent                                       |
+-----------------------+------------------------------+---------+--------------------------------------------------------------------------------------------------+
| org.onap.ccsdk.parent | spring-boot-1-starter-parent | 1.5.7   | Parent used in place of spring-boot-starter-parent for Springboot 1.x.                           |
|                       |                              |         | *NOTE* This is deprecated and will be removed in Guilin, since springboot 1.x should no          |
|                       |                              |         | longer be used due to security issues                                                            |
+-----------------------+------------------------------+---------+--------------------------------------------------------------------------------------------------+
| org.onap.ccsdk.parent | spring-boot-starter-parent   | 1.5.7   | Parent used in place of spring-boot-starter-parent for Springboot 2.x                            |
+-----------------------+------------------------------+---------+--------------------------------------------------------------------------------------------------+
| org.onap.ccsdk.parent | standalone-parent            | 1.5.7   | Parent used for projects that have no need for other third party parent poms                     |
+-----------------------+------------------------------+---------+--------------------------------------------------------------------------------------------------+

ccsdk/sli/core
^^^^^^^^^^^^^^
The ccsdk/sli/core library provides base functionality needed by the Service Logic Interpreter (SLI), which is the engine that runs directed graphs.  It also
provides a number of libraries that can be used by other CCSDK client projects.  

The following table lists the maven artifacts provided for use by CCSDK client
projects.

+-------------------------+-------------------------+---------+--------------------------------------------+
| groupId                 | artifactId              | version | Description                                |
+=========================+=========================+=========+============================================+
| org.onap.ccsdk.sli.core | dblib-provider          | 0.7.2   | Database access library                    |
+-------------------------+-------------------------+---------+--------------------------------------------+
| org.onap.ccsdk.sli.core | sli-common              | 0.7.2   | Common SLI data objects                    |
+-------------------------+-------------------------+---------+--------------------------------------------+
| org.onap.ccsdk.sli.core | sli-provider-base       | 0.7.2   | ODL-independent SLI implementation objects |
+-------------------------+-------------------------+---------+--------------------------------------------+
| org.onap.ccsdk.sli.core | sli-provider            | 0.7.2   | ODL-dependent SLI implementation objects   |
+-------------------------+-------------------------+---------+--------------------------------------------+
| org.onap.ccsdk.sli.core | sliPluginUtils-provider | 0.7.2   | Utilities for use in SLI adaptors/plugins  |
+-------------------------+-------------------------+---------+--------------------------------------------+
| org.onap.ccsdk.sli.core | utils-provider          | 0.7.2   | Utilities                                  |
+-------------------------+-------------------------+---------+--------------------------------------------+

ccsdk/sli/adaptors
^^^^^^^^^^^^^^^^^^
The ccsdk/sli/adaptors library provides interface adaptors meant to be used in resource nodes in directed graphs.

The following table lists the maven artifacts provided for use by CCSDK client
projects.

+-----------------------------+------------------------------+---------+--------------------------------+
| groupId                     | artifactId                   | version | Description                    |
+=============================+==============================+=========+================================+
| org.onap.ccsdk.sli.adaptors | aai-service-provider         | 0.7.3   | A&AI interface adaptor         |
+-----------------------------+------------------------------+---------+--------------------------------+
| org.onap.ccsdk.sli.adaptors | ansible-adapter-bundle       | 0.7.3   | Ansible interface adaptor      |
+-----------------------------+------------------------------+---------+--------------------------------+
| org.onap.ccsdk.sli.adaptors | mdsal-resource-provider      | 0.7.3   | MD-SAL interface adaptor       |
+-----------------------------+------------------------------+---------+--------------------------------+
| org.onap.ccsdk.sli.adaptors | netbox-client-provider       | 0.7.3   | netbox interface adaptor       |
+-----------------------------+------------------------------+---------+--------------------------------+
| org.onap.ccsdk.sli.adaptors | resource-assignment-provider | 0.7.3   | resource allocator             |
+-----------------------------+------------------------------+---------+--------------------------------+
| org.onap.ccsdk.sli.adaptors | saltstack-adaptor-provider   | 0.7.3   | saltstack interface adaptor    |
+-----------------------------+------------------------------+---------+--------------------------------+
| org.onap.ccsdk.sli.adaptors | sql-resource-provider        | 0.7.3   | SQL database interface adaptor |
+-----------------------------+------------------------------+---------+--------------------------------+

ccsdk/sli/northbound
^^^^^^^^^^^^^^^^^^^^
The ccsdk/sli/northbound library contains the code for northbound interfaces which typically invoke
the SLI.

The following table lists the maven artifacts provided for use by CCSDK client projects.

+-------------------------------+---------------------+---------+-----------------------------------------+
| groupId                       | artifactId          | version | Description                             |
+===============================+=====================+=========+=========================================+
| org.onap.ccsdk.sli.northbound | asdcApi-provider    | 0.7.4   | ODL-based SDC interface                 |
+-------------------------------+---------------------+---------+-----------------------------------------+
| org.onap.ccsdk.sli.northbound | dataChange-provider | 0.7.4   | A&AI data change notification interface |
+-------------------------------+---------------------+---------+-----------------------------------------+
| org.onap.ccsdk.sli.northbound | dmaap-listener      | 0.7.4   | DMaaP listener interface                |
+-------------------------------+---------------------+---------+-----------------------------------------+
| org.onap.ccsdk.sli.northbound | lcm-provider        | 0.7.4   | Life Cycle Management event interface   |
+-------------------------------+---------------------+---------+-----------------------------------------+
| org.onap.ccsdk.sli.northbound | ueb-listener        | 0.7.4   | SDC event listener                      |
+-------------------------------+---------------------+---------+-----------------------------------------+

ccsdk/sli/plugins
^^^^^^^^^^^^^^^^^
The ccsdk/sli/northbound library contains the code for plugins meant to be called from an 'execute' node
in a directed graph.

The following table lists the maven artifacts provided for use by CCSDK client projects.

+----------------------------+----------------------------+---------+-------------------------------------------------------+
| groupId                    | artifactId                 | version | Description                                           |
+============================+============================+=========+=======================================================+
| org.onap.ccsdk.sli.plugins | properties-node-provider   | 0.7.2   | Used to load a properties file for use in             |
|                            |                            |         | a directed graph                                      |
+----------------------------+----------------------------+---------+-------------------------------------------------------+
| org.onap.ccsdk.sli.plugins | restapi-call-node-provider | 0.7.2   | Used to call a generic REST API from a directed       |
|                            |                            |         | graph                                                 |
+----------------------------+----------------------------+---------+-------------------------------------------------------+
| org.onap.ccsdk.sli.plugins | restconf-client-provider   | 0.7.2   | Used to call a RESTCONF API from a directed graph     |
+----------------------------+----------------------------+---------+-------------------------------------------------------+
| org.onap.ccsdk.sli.plugins | sshapi-call-node           | 0.7.2   | Used to invoke an SSH interface from a directed graph |
+----------------------------+----------------------------+---------+-------------------------------------------------------+
| org.onap.ccsdk.sli.plugins | template-node-provider     | 0.7.2   | Provides velocity template support                    |
+----------------------------+----------------------------+---------+-------------------------------------------------------+

Documentation Deliverables
~~~~~~~~~~~~~~~~~~~~~~~~~~
* `CDS user guide`_
* `SDN Controller for Radio user guide`_
* `ccsdk/sli/core Javadoc`_
* `ccsdk/sli/adaptors Javadoc`_
* `ccsdk/sli/northbound Javadoc`_
* `ccsdk/sli/plugins Javadoc`_

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

The following security issues have been addressed in the Frankfurt CCSDK release:

* `OSJI-197 <https://jira.onap.org/browse/OJSI-197>`_ : cds-blueprints-processor-http exposes plain text HTTP endpoint using port 30499
* `CCSDK-2149 <https://jira.onap.org/browse/CCSDK-2149>`_ : Pods still run as root
* `CCSDK-1910 <https://jira.onap.org/browse/CCSDK-1910>`_ : Password removal from OOM Helm charts

With these fixes, CCSDK no longer exposes any external http ports and no CCSDK pod runs as root.

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
.. _`ccsdk/sli/core Javadoc`: https://nexus.onap.org/service/local/repositories/javadoc/content/org.onap.ccsdk/sli/core/frankfurt/index.html
.. _`ccsdk/sli/adaptors Javadoc`: https://nexus.onap.org/service/local/repositories/javadoc/content/org.onap.ccsdk/sli/adaptors/frankfurt/index.html
.. _`ccsdk/sli/northbound Javadoc`: https://nexus.onap.org/service/local/repositories/javadoc/content/org.onap.ccsdk/sli/northbound/frankfurt/index.html
.. _`ccsdk/sli/plugins Javadoc`: https://nexus.onap.org/service/local/repositories/javadoc/content/org.onap.ccsdk/sli/plugins/frankfurt/index.html
