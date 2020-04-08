.. This work is licensed under a Creative Commons Attribution 4.0 International License.
.. http://creativecommons.org/licenses/by/4.0
.. _architecture:

Architecture
============

Repositories
------------
CCSDK contains the following repositories to support service logic (aka directed graph)
development:

- ccsdk/parent : contains parent poms, which contain common properties, plugin settings, etc
- ccsdk/sli/core : contains the core components needed to compile and execute directed graphs
- ccsdk/sli/adaptors : contains adaptors to provide access to resources from within directed graphs
- ccsdk/sli/northbound : contains code for northbound interfaces that maybe used by CCSDK clients
- ccsdk/sli/plugins : contains code to be called from directed graph "execute" nodes

Capabilities
------------
Provides the core Service Logic Interpreter (SLI) functionality, used to execute directed graphs (DGs).  Directed graphs allow service designers to define the
logic to be executed within the SDN controller in a graphical format which can be
updated in real time, without a need to restart the controller.

.. toctree::
   :maxdepth: 1

   nodes.rst


