#!/bin/bash

###
# ============LICENSE_START=======================================================
# openECOMP : SDN-C
# ================================================================================
# Copyright (C) 2017 AT&T Intellectual Property. All rights
# 							reserved.
# ================================================================================
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
# ============LICENSE_END=========================================================
###

ODL_HOME=${ODL_HOME:-/opt/opendaylight/current}
ODL_ADMIN_PASSWORD=${ODL_ADMIN_PASSWORD:-Kp8bJ4SXszM0WXlhak3eHlcse2gAw84vaoGGmJvUy2U}
SDNC_HOME=${SDNC_HOME:-/opt/onap/sdnc}
SDNC_FEATURE_DIR=${SDNC_FEATURE_DIR:-${SDNC_HOME}/features}

SDNC_CORE_FEATURES=" \
 dblib \
 filters \
 sli \
 sliPluginUtils \
 sliapi"

SDNC_ADAPTORS_FEATURES=" \
  aai-service \
  mdsal-resource \
  resource-assignment \
  sql-resource"

SDNC_NORTHBOUND_FEATURES=" \
  asdcApi \
  dataChange

SDNC_PLUGINS_FEATURES=" \
  properties-node \
  restapi-call-node"


SDNC_CORE_VERSION=${SDNC_CORE_VERSION:-0.0.1-SNAPSHOT}
SDNC_ADAPTORS_VERSION=${SDNC_ADAPTORS_VERSION:-0.0.1-SNAPSHOT}
SDNC_NORTHBOUND_VERSION=${SDNC_NORTHBOUND_VERSION:-0.0.1-SNAPSHOT}
SDNC_PLUGINS_VERSION=${SDNC_PLUGINS_VERSION:-0.0.1-SNAPSHOT}

echo "Enabling core features"
${ODL_HOME}/bin/client -u karaf feature:install odl-mdsal-all
${ODL_HOME}/bin/client -u karaf feature:install odl-mdsal-apidocs
${ODL_HOME}/bin/client -u karaf feature:install odl-restconf-all




echo "Installing SDN-C core"
for feature in ${SDNC_CORE_FEATURES}
do
  if [ -f ${SDNC_FEATURE_DIR}/sdnc-${feature}/install-feature.sh ]
  then
    ${SDNC_FEATURE_DIR}/sdnc-${feature}/install-feature.sh
  else
    echo "No installer found for feature sdnc-${feature}"
  fi
done

echo "Installing SDN-C adaptors"
for feature in ${SDNC_ADAPTORS_FEATURES}
do
  if [ -f ${SDNC_FEATURE_DIR}/sdnc-${feature}/install-feature.sh ]
  then
    ${SDNC_FEATURE_DIR}/sdnc-${feature}/install-feature.sh
  else
    echo "No installer found for feature sdnc-${feature}"
  fi
done

echo "Installing SDN-C northbound"
for feature in ${SDNC_NORTHBOUND_FEATURES}
do
  if [ -f ${SDNC_FEATURE_DIR}/sdnc-${feature}/install-feature.sh ]
  then
    ${SDNC_FEATURE_DIR}/sdnc-${feature}/install-feature.sh
  else
    echo "No installer found for feature sdnc-${feature}"
  fi
done

echo "Installing SDN-C plugins"
for feature in ${SDNC_PLUGINS_FEATURES}
do
  if [ -f ${SDNC_FEATURE_DIR}/sdnc-${feature}/install-feature.sh ]
  then
    ${SDNC_FEATURE_DIR}/sdnc-${feature}/install-feature.sh
  else
    echo "No installer found for feature sdnc-${feature}"
  fi
done
