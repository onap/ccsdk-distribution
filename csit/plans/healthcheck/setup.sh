#!/bin/bash
#
# Copyright 2016-2017 Huawei Technologies Co., Ltd.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
# Modifications copyright (c) 2017 AT&T Intellectual Property
# Modifications copyright (c) 2020-2021 Samsung Electronics Co., Ltd.
#

export MTU=$(/sbin/ifconfig | grep MTU | sed 's/.*MTU://' | sed 's/ .*//' | sort -n | head -1)
export DMAAP_TOPIC=AUTO

# TODO: any reason to ever read the version from version.properties? 
export CCSDK_DOCKER_IMAGE_VERSION=latest

if [ "$MTU" == "" ]; then
	  export MTU="1450"
fi

# Copy default docker-compose.yaml to archives for CSIT modification
mkdir -p $WORKSPACE/archives/yaml
cp $WORKSPACE/../src/main/yaml/docker-compose.yml $WORKSPACE/archives/yaml
cd $WORKSPACE/archives/yaml
unset http_proxy https_proxy

sed -i "s/DMAAP_TOPIC_ENV=.*/DMAAP_TOPIC_ENV="AUTO"/g" docker-compose.yml

# TODO: is there ever need to pull the images from Nexus?
# run-csit.sh already logins to nexus3.onap.org:10001 so this now works only if
# NEXUS_DOCKER_REPO is not defined at all (in which case the images must be available
# locally without any repository prefix) or if its value is nexus3.onap.org:10001

if [ "$NEXUS_DOCKER_REPO" != "" ]; then
   docker pull $NEXUS_DOCKER_REPO/onap/ccsdk-odlsli-alpine-image:$CCSDK_DOCKER_IMAGE_VERSION
   docker pull $NEXUS_DOCKER_REPO/onap/ccsdk-dgbuilder-image:$CCSDK_DOCKER_IMAGE_VERSION
   # Add trailing slash for docker-compose
   export NEXUS_DOCKER_REPO=$NEXUS_DOCKER_REPO/
fi

# start CCSDK containers with docker compose and configuration from docker-compose.yml
curl -L https://github.com/docker/compose/releases/download/1.9.0/docker-compose-`uname -s`-`uname -m` > docker-compose
chmod +x docker-compose
./docker-compose up -d

# WAIT 5 minutes maximum and check karaf.log for readiness every 10 seconds

TIME_OUT=360
INTERVAL=10
TIME=0
while [ "$TIME" -lt "$TIME_OUT" ]; do

docker exec ccsdk_odlsli_container cat /opt/opendaylight/data/log/karaf.log | grep 'warp coils'

  if [ $? == 0 ] ; then
    echo CCSDK karaf started in $TIME seconds
    break;
  fi

  echo Sleep $INTERVAL seconds before testing if CCSDK is up. Total wait time up until now is $TIME seconds. Timeout is $TIME_OUT seconds
  sleep $INTERVAL
  TIME=$(($TIME+$INTERVAL))
done

if [ "$TIME" -ge "$TIME_OUT" ]; then
   echo TIME OUT: karaf session not started in $TIME_OUT seconds, setup failed
   echo "karaf.log follows:"
   docker exec ccsdk_odlsli_container cat /opt/opendaylight/data/log/karaf.log
   exit 1;
fi

echo "*TRACE* bundle list : $(docker exec -i ccsdk_odlsli_container /opt/opendaylight/current/bin/client bundle:list)"

num_bundles=$(docker exec -i ccsdk_odlsli_container /opt/opendaylight/current/bin/client bundle:list | tail -1 | cut -d' ' -f1)

  if [ "$num_bundles" -ge 333 ]; then
    num_bundles=$(docker exec -i ccsdk_odlsli_container /opt/opendaylight/current/bin/client bundle:list | tail -1 | cut -d' ' -f1)
    num_failed_bundles=$(docker exec -i ccsdk_odlsli_container /opt/opendaylight/current/bin/client bundle:list | grep Failure | wc -l)
    failed_bundles=$(docker exec -i ccsdk_odlsli_container /opt/opendaylight/current/bin/client bundle:list | grep Failure)
    echo There is/are $num_failed_bundles failed bundles out of $num_bundles installed bundles.
  fi

if [ "$num_failed_bundles" -ge 1 ]; then
  echo "The following bundle(s) are in a failed state: "
  echo "  $failed_bundles"
fi

# Pass any variables required by Robot test suites in ROBOT_VARIABLES
ROBOT_VARIABLES="-v SCRIPTS:${SCRIPTS}"

