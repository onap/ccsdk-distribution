#!/bin/bash
#
# Copyright 2020 © Samsung Electronics Co., Ltd.
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

DOCKER_REPOSITORY="nexus3.onap.org:10003"
ORG="onap"
IMAGES=("ccsdk-dgbuilder-image" "ccsdk-odlsli-alpine-image")
IMAGE_NAME_BASE="${DOCKER_REPOSITORY}/${ORG}/"
TAG_NAME=${UNIQUE_DOCKER_TAG}
TIMESTAMP=`date +'%Y%m%dT%H%M%SZ'`
set -x
# Create tags based on version.properties
source ../version.properties
LATEST_MINOR_TAG=${release_name}.${sprint_number}-STAGING-latest
LATEST_FULL_TAG=${release_name}.${sprint_number}.${feature_revision}-STAGING-latest
LATEST_FULL_TIMESTAMP_TAG=${release_name}.${sprint_number}.${feature_revision}-STAGING-${TIMESTAMP}

if [ ! -z "${TAG_NAME}" ]; then
for i in ${!IMAGES[@]};
  do
    image=${IMAGE_NAME_BASE}${IMAGES[$i]}
    echo "Push STAGING tags for docker image ${image}"
    docker pull ${image}:${snapshot_version}-${TAG_NAME}

    docker tag ${image}:${snapshot_version}-${TAG_NAME} ${image}:${LATEST_MINOR_TAG}
    docker tag ${image}:${snapshot_version}-${TAG_NAME} ${image}:${LATEST_FULL_TAG}
    docker tag ${image}:${snapshot_version}-${TAG_NAME} ${image}:${LATEST_FULL_TIMESTAMP_TAG}

    docker push ${image}:${LATEST_MINOR_TAG}
    docker push ${image}:${LATEST_FULL_TAG}
    docker push ${image}:${LATEST_FULL_TIMESTAMP_TAG}

  done
fi

