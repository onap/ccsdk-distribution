.. raw:: html

   <!--
   ============LICENSE_START=======================================================
   org.onap.ccsdk
   ================================================================================
   Copyright (c) 2017 AT&T Intellectual Property. All rights reserved.
   ================================================================================
   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
   ============LICENSE_END=========================================================
   -->

DNS/Designate Plugin
====================

Cloudify DNS/Designate plugin description # Description The
DNS/Designate plugin extends the concepts of the Cloudify OpenStack
plugin to include using the DNS/Designate service, to set up and tear
down DNS "A" and "CNAME" records, as part of a Cloudify blueprint. #
Plugin Requirements \* Python versions \* 2.7.x

Note: These requirements apply to the VM where Cloudify Manager itself
runs.

Note: Cloudify Manager, itself, requires Python 2.7.x (and CentOS 7).

Types
=====

ccsdk.nodes.dns.arecord
-----------------------

**Derived From:** cloudify.nodes.Root

**Properties:**

-  ``fqdn`` (required string) The FQDN for the set of DNS A records to
   be managed. The DNS zone to which this FQDN belongs is assumed to be
   the entire FQDN following the first dot. This value must not end with
   a dot. The provided openstack credentials must allow updating records
   in the DNS zone.
-  ``ttl`` (optional integer default=300) The time to live, in seconds,
   of the DNS entries.
-  ``openstack`` (required map) The set of configuration parameters to
   use for accessing the OpenStack DNS service: username, password,
   tenant\_name, auth\_url, and region.

**Mapped Operations:**

-  ``cloudify.interfaces.lifecycle.create`` Creates or updates the type
   "A" recordset for the specified FQDN. \*\* ``Inputs:`` \*\*\*
   ``args`` Key-value configuration \*\*\*\* ``ip_addresses`` (required
   sequence of string) A non-empty list of IP addresses corresponding to
   the FQDN
-  ``cloudify.interfaces.lifecycle.delete`` Deletes the type "A"
   recordset, if any, for the specified FQDN.

**Attributes:** This type has no runtime attributes

ccsdk.nodes.dns.cnamerecord
---------------------------

**Derived From:** cloudify.nodes.Root

**Properties:**

-  ``fqdn`` (required string) The FQDN for the DNS CNAME record to be
   managed. The DNS zone to which this FQDN belongs is assumed to be the
   entire FQDN following the first dot. This value must not end with a
   dot. The provided openstack credentials must allow updating records
   in the DNS zone.
-  ``ttl`` (optional integer default=300) The time to live, in seconds,
   of the DNS entry.
-  ``openstack`` (required map) The set of configuration parameters to
   use for accessing the OpenStack DNS service: username, password,
   tenant\_name, auth\_url, and region.

**Mapped Operations:**

-  ``cloudify.interfaces.lifecycle.create`` Creates or updates the type
   "CNAME" recordset for the specified FQDN. \*\* ``Inputs:`` \*\*\*
   ``args`` Key-value configuration \*\*\*\* ``cname`` (required string)
   The FQDN that this CNAME record should point to. This value must not
   end with at dot.
-  ``cloudify.interfaces.lifecycle.delete`` Deletes the type "CNAME"
   recordset, if any, for the specified FQDN.

**Attributes:** This type has no runtime attributes

Relationships
=============

This plugin does not define or use any relationships
