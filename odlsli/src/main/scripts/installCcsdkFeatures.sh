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
CCSDK_HOME=${CCSDK_HOME:-/opt/onap/ccsdk}
CCSDK_FEATURE_DIR=${CCSDK_FEATURE_DIR:-${CCSDK_HOME}/features}

CCSDK_CORE_FEATURES=" \
 slicore-utils \
 dblib \
 sli \
 filters \
 sliPluginUtils \
 sliapi"

CCSDK_ADAPTORS_FEATURES=" \
  aai-service \
  mdsal-resource \
  resource-assignment \
  sql-resource"

CCSDK_NORTHBOUND_FEATURES=" \
  asdcApi \
 dataChange"

CCSDK_PLUGINS_FEATURES=" \
  properties-node \
  restapi-call-node"


CCSDK_CORE_VERSION=${CCSDK_CORE_VERSION:-0.0.1-SNAPSHOT}
CCSDK_ADAPTORS_VERSION=${CCSDK_ADAPTORS_VERSION:-0.0.1-SNAPSHOT}
CCSDK_NORTHBOUND_VERSION=${CCSDK_NORTHBOUND_VERSION:-0.0.1-SNAPSHOT}
CCSDK_PLUGINS_VERSION=${CCSDK_PLUGINS_VERSION:-0.0.1-SNAPSHOT}

echo "Enabling core features"
${ODL_HOME}/bin/client feature:install odl-restconf-all odl-mdsal-all odl-mdsal-apidocs odl-daexim-all

echo "Installing CCSDK sli/core"
for feature in ${CCSDK_CORE_FEATURES}
do
  if [ -f ${CCSDK_FEATURE_DIR}/ccsdk-${feature}/install-feature.sh ]
  then
    ${CCSDK_FEATURE_DIR}/ccsdk-${feature}/install-feature.sh
  else
    echo "No installer found for feature ccsdk-${feature}"
  fi
done

echo "Installing CCSDK sli/adaptors"
for feature in ${CCSDK_ADAPTORS_FEATURES}
do
  if [ -f ${CCSDK_FEATURE_DIR}/ccsdk-${feature}/install-feature.sh ]
  then
    ${CCSDK_FEATURE_DIR}/ccsdk-${feature}/install-feature.sh
  else
    echo "No installer found for feature ccsdk-${feature}"
  fi
done

echo "Installing CCSDK sli/northbound"
for feature in ${CCSDK_NORTHBOUND_FEATURES}
do
  if [ -f ${CCSDK_FEATURE_DIR}/ccsdk-${feature}/install-feature.sh ]
  then
    ${CCSDK_FEATURE_DIR}/ccsdk-${feature}/install-feature.sh
  else
    echo "No installer found for feature ccsdk-${feature}"
  fi
done


echo "Installing CCSDK sli/plugins"
for feature in ${CCSDK_PLUGINS_FEATURES}
do
  if [ -f ${CCSDK_FEATURE_DIR}/ccsdk-${feature}/install-feature.sh ]
  then
    ${CCSDK_FEATURE_DIR}/ccsdk-${feature}/install-feature.sh
  else
    echo "No installer found for feature ccsdk-${feature}"
  fi
done
