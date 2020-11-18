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
| **Release designation** | Guilin                                 |
|                         |                                           |
+-------------------------+-------------------------------------------+
| **Release date**        | 11/19/2020                                |
|                         |                                           |
+-------------------------+-------------------------------------------+


New features
------------

The CCSDK Guilin release includes the following features:

* Upgrade to OpenDaylight Sodium release (Jira `CCSDK-2396 <https://jira.onap.org/browse/CCSDK-2396>`_)
* Upgrade to Java 11 (Jira `CCSDK-2422 <https://jira.onap.org/browse/CCSDK-2422>`_)
* Second phase of OpenDaylight Decouple (Jira `CCSDK-2093 <https://jira.onap.org/browse/CCSDK-2093>`_)
* A1 Adapter Evolution (Jira `CCSDK-2475 <https://jira.onap.org/browse/CCSDK-2475>`_)
* A1 Policy Management (Jira `CCSDK-2476 <https://jira.onap.org/browse/CCSDK-2476>`_)
* Network Slicing (Jira `CCSDK-2533 <https://jira.onap.org/browse/CCSDK-2533>`_)

Downstream projects that are consuming CCSDK maven artifacts, or that plan to ingest CCSDK as source and do local compiles should be
aware that the upgrades to OpenDaylight Sodium and to Java 11 are both potentially breaking changes.  Therefore, we consider
Guilin to be a  major release and have reflected this in our version numbering.

For the complete list of `CCSDK Guilin release epics <https://jira.onap.org/issues/?filter=12461>`_ and 
`CCSDK Guilin release user stories <https://jira.onap.org/issues/?filter=12462>`_ , please see the `ONAP Jira`_.

**Bug fixes**

The full list of `bugs fixed in the CCSDK Guilin release <https://jira.onap.org/issues/?filter=12463>`_ is maintained on the `ONAP Jira`_.

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

+-----------------------------------+--------------------------------------------+---------+
| Image name                        | Description                                | Version |
+===================================+============================================+=========+
| onap/ccsdk-alpine-image           | Base Alpine Linux image for CCSDK          | 1.0.3   |
+-----------------------------------+--------------------------------------------+---------+
| onap/ccsdk-ansible-server-image   | Ansible server image                       | 1.0.3   |
+-----------------------------------+--------------------------------------------+---------+
| onap/ccsdk-apps-ms-neng           | Naming microservice                        | 1.0.2   |
+-----------------------------------+--------------------------------------------+---------+
| onap/ccsdk-blueprints-processor   | CDS blueprint processor                    | 1.0.2   |
+-----------------------------------+--------------------------------------------+---------+
| onap/ccsdk-cds-ui                 | CDS web interface                          | 1.0.2   |
+-----------------------------------+--------------------------------------------+---------+
| onap/ccsdk-cds-ui-server          | CDS user interface back end                | 1.0.2   |
+-----------------------------------+--------------------------------------------+---------+
| onap/ccsdk-commandexecutor        | CDS command executor                       | 1.0.2   |
+-----------------------------------+--------------------------------------------+---------+
| onap/ccsdk-controllerblueprint    | CDS controller blueprints                  | 1.0.2   |
+-----------------------------------+--------------------------------------------+---------+
| onap/ccsdk-dgbuilder-image        | Directed graph builder                     | 1.0.3   |
+-----------------------------------+--------------------------------------------+---------+
| onap/ccsdk-odl-neon-alpine-image  | Alpine based OpenDaylight Neon SR1 image   | 1.0.3   |
+-----------------------------------+--------------------------------------------+---------+
| onap/ccsdk-odlsli-alpine-image    | Alpine based OpenDaylight image with CCSDK | 1.0.3   |
+-----------------------------------+--------------------------------------------+---------+
| onap/ccsdk-saltstack-server-image | Saltstack server                           | 1.0.3  |
+-----------------------------------+--------------------------------------------+---------+
| onap/ccsdk-sdclistener            | CDS SDC listener                           | 1.0.3   |
+-----------------------------------+--------------------------------------------+---------+
| onap/ccsdk-ubuntu-image           | Base Ubuntu image for CCSDK                | 1.0.3   |
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
| org.onap.ccsdk.parent | binding-parent               | 2.0.3   | Parent used in place of OpenDaylight binding-parent                                              |
+-----------------------+------------------------------+---------+--------------------------------------------------------------------------------------------------+
| org.onap.ccsdk.parent | bundle-parent                | 2.0.3   | Parent used in place of OpenDaylight bundle-parent                                               |
+-----------------------+------------------------------+---------+--------------------------------------------------------------------------------------------------+
| org.onap.ccsdk.parent | client-parent                | 2.0.3   | Parent used for projects that create client libraries for OpenDaylight APIs                      |
+-----------------------+------------------------------+---------+--------------------------------------------------------------------------------------------------+
| org.onap.ccsdk.parent | dependencies-bom             | 2.0.3   | Bill of Materials POM that defines versions of third party libraries used outside ODL container. |
|                       |                              |         | Intended to be imported in dependencyManagement section.                                         |
+-----------------------+------------------------------+---------+--------------------------------------------------------------------------------------------------+
| org.onap.ccsdk.parent | dependencies-odl-bom         | 2.0.3   | Bill of Materials POM that defines versions of third party libraries used within ODL container.  |
|                       |                              |         | Intended to be imported in dependencyManagement section.                                         |
+-----------------------+------------------------------+---------+--------------------------------------------------------------------------------------------------+
| org.onap.ccsdk.parent | feature-repo-parent          | 2.0.3   | Parent used in place of OpenDaylight feature-repo-parent                                         |
+-----------------------+------------------------------+---------+--------------------------------------------------------------------------------------------------+
| org.onap.ccsdk.parent | karaf4-parent                | 2.0.3   | Parent used in place of OpenDaylight karaf4-parent                                               |
+-----------------------+------------------------------+---------+--------------------------------------------------------------------------------------------------+
| org.onap.ccsdk.parent | mdsal-it-parent              | 2.0.3   | Parent used in place of OpenDaylight mdsal-it-parent                                             |
+-----------------------+------------------------------+---------+--------------------------------------------------------------------------------------------------+
| org.onap.ccsdk.parent | odlparent                    | 2.0.3   | Parent used in place of OpenDaylight odlparent                                                   |
+-----------------------+------------------------------+---------+--------------------------------------------------------------------------------------------------+
| org.onap.ccsdk.parent | odlparent-lite               | 2.0.3   | Parent used in place of OpenDaylight odlparent-lite                                              |
+-----------------------+------------------------------+---------+--------------------------------------------------------------------------------------------------+
| org.onap.ccsdk.parent | single-feature-parent        | 2.0.3   | Parent used in place of OpenDaylight single-feature-parent                                       |
+-----------------------+------------------------------+---------+--------------------------------------------------------------------------------------------------+
| org.onap.ccsdk.parent | spring-boot-1-starter-parent | 2.0.3   | Parent used in place of spring-boot-starter-parent for Springboot 1.x.                           |
|                       |                              |         | *NOTE* This is deprecated and will be removed in Guilin, since springboot 1.x should no          |
|                       |                              |         | longer be used due to security issues                                                            |
+-----------------------+------------------------------+---------+--------------------------------------------------------------------------------------------------+
| org.onap.ccsdk.parent | spring-boot-starter-parent   | 2.0.3   | Parent used in place of spring-boot-starter-parent for Springboot 2.x                            |
+-----------------------+------------------------------+---------+--------------------------------------------------------------------------------------------------+
| org.onap.ccsdk.parent | standalone-parent            | 2.0.3   | Parent used for projects that have no need for other third party parent poms                     |
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
| org.onap.ccsdk.sli.core | dblib-provider          | 1.0.2   | Database access library                    |
+-------------------------+-------------------------+---------+--------------------------------------------+
| org.onap.ccsdk.sli.core | sli-common              | 1.0.2   | Common SLI data objects                    |
+-------------------------+-------------------------+---------+--------------------------------------------+
| org.onap.ccsdk.sli.core | sli-provider-base       | 1.0.2   | ODL-independent SLI implementation objects |
+-------------------------+-------------------------+---------+--------------------------------------------+
| org.onap.ccsdk.sli.core | sli-provider            | 1.0.2   | ODL-dependent SLI implementation objects   |
+-------------------------+-------------------------+---------+--------------------------------------------+
| org.onap.ccsdk.sli.core | sliPluginUtils-provider | 1.0.2   | Utilities for use in SLI adaptors/plugins  |
+-------------------------+-------------------------+---------+--------------------------------------------+
| org.onap.ccsdk.sli.core | utils-provider          | 1.0.2   | Utilities                                  |
+-------------------------+-------------------------+---------+--------------------------------------------+

ccsdk/sli/adaptors
^^^^^^^^^^^^^^^^^^
The ccsdk/sli/adaptors library provides interface adaptors meant to be used in resource nodes in directed graphs.

The following table lists the maven artifacts provided for use by CCSDK client
projects.

+-----------------------------+------------------------------+---------+--------------------------------+
| groupId                     | artifactId                   | version | Description                    |
+=============================+==============================+=========+================================+
| org.onap.ccsdk.sli.adaptors | aai-service-provider         | 1.0.2   | A&AI interface adaptor         |
+-----------------------------+------------------------------+---------+--------------------------------+
| org.onap.ccsdk.sli.adaptors | ansible-adapter-bundle       | 1.0.2   | Ansible interface adaptor      |
+-----------------------------+------------------------------+---------+--------------------------------+
| org.onap.ccsdk.sli.adaptors | mdsal-resource-provider      | 1.0.2   | MD-SAL interface adaptor       |
+-----------------------------+------------------------------+---------+--------------------------------+
| org.onap.ccsdk.sli.adaptors | netbox-client-provider       | 1.0.2   | netbox interface adaptor       |
+-----------------------------+------------------------------+---------+--------------------------------+
| org.onap.ccsdk.sli.adaptors | resource-assignment-provider | 1.0.2   | resource allocator             |
+-----------------------------+------------------------------+---------+--------------------------------+
| org.onap.ccsdk.sli.adaptors | saltstack-adaptor-provider   | 1.0.2   | saltstack interface adaptor    |
+-----------------------------+------------------------------+---------+--------------------------------+
| org.onap.ccsdk.sli.adaptors | sql-resource-provider        | 1.0.2   | SQL database interface adaptor |
+-----------------------------+------------------------------+---------+--------------------------------+

ccsdk/sli/northbound
^^^^^^^^^^^^^^^^^^^^
The ccsdk/sli/northbound library contains the code for northbound interfaces which typically invoke
the SLI.

The following table lists the maven artifacts provided for use by CCSDK client projects.

+-------------------------------+---------------------+---------+-----------------------------------------+
| groupId                       | artifactId          | version | Description                             |
+===============================+=====================+=========+=========================================+
| org.onap.ccsdk.sli.northbound | asdcApi-provider    | 1.0.2   | ODL-based SDC interface                 |
+-------------------------------+---------------------+---------+-----------------------------------------+
| org.onap.ccsdk.sli.northbound | dataChange-provider | 1.0.2   | A&AI data change notification interface |
+-------------------------------+---------------------+---------+-----------------------------------------+
| org.onap.ccsdk.sli.northbound | dmaap-listener      | 1.0.2   | DMaaP listener interface                |
+-------------------------------+---------------------+---------+-----------------------------------------+
| org.onap.ccsdk.sli.northbound | lcm-provider        | 1.0.2   | Life Cycle Management event interface   |
+-------------------------------+---------------------+---------+-----------------------------------------+
| org.onap.ccsdk.sli.northbound | ueb-listener        | 1.0.2   | SDC event listener                      |
+-------------------------------+---------------------+---------+-----------------------------------------+

ccsdk/sli/plugins
^^^^^^^^^^^^^^^^^
The ccsdk/sli/northbound library contains the code for plugins meant to be called from an 'execute' node
in a directed graph.

The following table lists the maven artifacts provided for use by CCSDK client projects.

+----------------------------+----------------------------+---------+-------------------------------------------------------+
| groupId                    | artifactId                 | version | Description                                           |
+============================+============================+=========+=======================================================+
| org.onap.ccsdk.sli.plugins | properties-node-provider   | 1.0.2   | Used to load a properties file for use in             |
|                            |                            |         | a directed graph                                      |
+----------------------------+----------------------------+---------+-------------------------------------------------------+
| org.onap.ccsdk.sli.plugins | restapi-call-node-provider | 1.0.2   | Used to call a generic REST API from a directed       |
|                            |                            |         | graph                                                 |
+----------------------------+----------------------------+---------+-------------------------------------------------------+
| org.onap.ccsdk.sli.plugins | restconf-client-provider   | 1.0.2   | Used to call a RESTCONF API from a directed graph     |
+----------------------------+----------------------------+---------+-------------------------------------------------------+
| org.onap.ccsdk.sli.plugins | sshapi-call-node           | 1.0.2   | Used to invoke an SSH interface from a directed graph |
+----------------------------+----------------------------+---------+-------------------------------------------------------+
| org.onap.ccsdk.sli.plugins | template-node-provider     | 1.0.2   | Provides velocity template support                    |
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
.. _`ccsdk/sli/core Javadoc`: https://nexus.onap.org/service/local/repositories/javadoc/content/org.onap.ccsdk/sli/core/frankfurt/index.html
.. _`ccsdk/sli/adaptors Javadoc`: https://nexus.onap.org/service/local/repositories/javadoc/content/org.onap.ccsdk/sli/adaptors/frankfurt/index.html
.. _`ccsdk/sli/northbound Javadoc`: https://nexus.onap.org/service/local/repositories/javadoc/content/org.onap.ccsdk/sli/northbound/frankfurt/index.html
.. _`ccsdk/sli/plugins Javadoc`: https://nexus.onap.org/service/local/repositories/javadoc/content/org.onap.ccsdk/sli/plugins/frankfurt/index.html
