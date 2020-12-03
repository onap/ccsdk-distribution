#!/bin/bash -x
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


# $1 test options (passed on to run-csit.sh as such)
# 
# UNIQUE_DOCKER_TAG environment variable is expected to be used
# by all test plans whenever it is defined. If it's not defined,
# local execution is assumed and plain "latest" should be used
# by setup scripts to allow the use of locally build docker images 
#

set -x
export TESTOPTIONS=${1}
# GERRIT_BRANCH for checking out integration/csit should be the same as
# current project clone branch
export GERRIT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
export WORKSPACE=$(git rev-parse --show-toplevel)/csit

rm -rf ${WORKSPACE}/archives
mkdir -p ${WORKSPACE}/archives
rm -rf ${WORKSPACE}/data
mkdir -p ${WORKSPACE}/data

cd ${WORKSPACE}/data
git clone https://gerrit.onap.org/r/integration/csit
cd csit
# make best-effort attempt to checkout branch that corresponds to current
# project repository clone if the checkout fails for any reason,
# the cloned integration/csit remains on master
git checkout ${GERRIT_BRANCH}
cp *.sh ${WORKSPACE}/
cd ${WORKSPACE}
# Execute all testsuites defined under plans subdirectory
for dir in plans/*/
do
    dir=${dir%*/}  # remove the trailing /
   ./run-csit.sh ${dir} ${TESTOPTIONS}
done
