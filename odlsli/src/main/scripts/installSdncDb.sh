#!/bin/bash

###
# ============LICENSE_START=======================================================
# ONAP : SDN-C
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

CCSDK_HOME=${CCSDK_HOME:-/opt/onap/ccsdk}
MYSQL_HOST=${MYSQL_HOST:-dbhost}
MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD:-openECOMP1.0}

SDNC_DB_USER=${SDNC_DB_USER:-sdnctl}
SDNC_DB_PASSWORD=${SDNC_DB_PASSWORD:-gamma}
SDNC_DB_DATABASE=${SDN_DB_DATABASE:-sdnctl}

echo -e "\nCreating database:($SDNC_DB_DATABASE) and user:($SDNC_DB_USER)"
# Create tablespace and user account
mysql -h ${MYSQL_HOST} -u root -p${MYSQL_ROOT_PASSWORD} mysql <<-END
CREATE DATABASE IF NOT EXISTS ${SDNC_DB_DATABASE};
CREATE USER IF NOT EXISTS '${SDNC_DB_USER}'@'localhost' IDENTIFIED BY '${SDNC_DB_PASSWORD}';
CREATE USER IF NOT EXISTS '${SDNC_DB_USER}'@'%' IDENTIFIED BY '${SDNC_DB_PASSWORD}';
GRANT ALL PRIVILEGES ON ${SDNC_DB_DATABASE}.* TO '${SDNC_DB_USER}'@'localhost' WITH GRANT OPTION;
GRANT ALL PRIVILEGES ON ${SDNC_DB_DATABASE}.* TO '${SDNC_DB_USER}'@'%' WITH GRANT OPTION;
flush privileges;
commit;
END

# load schema
if [ -f ${CCSDK_HOME}/data/odlsli.dump ]
then
    mysql -h ${MYSQL_HOST} -u root -p${MYSQL_ROOT_PASSWORD} ${SDNC_DB_DATABASE} < ${CCSDK_HOME}/data/odlsli.dump
    echo -e "\n ${SDNC_DB_DATABASE} schema loaded."
fi
