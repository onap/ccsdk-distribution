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

set -x
source ../version.properties
if [ ! -z "${TAG_NAME}" ]; then
for i in ${!IMAGES[@]};
  do
    image=${IMAGE_NAME_BASE}${IMAGES[$i]}
    echo "Push STAGING tag for docker image ${image}"
    docker pull ${image}:${snapshot_version}-${TAG_NAME}
    docker tag ${image}:${snapshot_version}-${TAG_NAME} ${image}:${release_name}.${sprint_number}.${feature_revision}-STAGING-latest
    docker push ${image}:${release_name}.${sprint_number}.${feature_revision}-STAGING-latest
  done
fi

