#!/bin/bash

###
# ============LICENSE_START=======================================================
# ONAP : CCSDK
# ================================================================================
# Copyright (C) 2020 AT&T Intellectual Property. All rights
#                             reserved.
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

export CCSDK_HOME=${CCSDK_HOME:-/opt/onap/ccsdk}
export SLIBOOT_JAR=${SLIBOOT_JAR:-${ccsdk.sliboot.jar}}
export SVCLOGIC_DIR=${SVCLOGIC_DIR:-opt/onap/ccsdk/svclogic/graphs}
export LOG_PATH=${LOG_PATH:-/var/log/onap/ccsdk}
export CCSDK_CONFIG_DIR=${CCSDK_CONFIG_DIR:-/opt/onap/ccsdk/config}
export JAVA_SECURITY_DIR=${JAVA_SECURITY_DIR:-/etc/ssl/certs/java}

#
# Wait for database
#
echo "Waiting for database"
until mysqladmin ping -h dbhost --silent
do
  printf "."
  sleep 1
done
echo -e "\nDatabase ready"

# Create tablespace and user account

mysql -h ${MYSQL_DB_HOST} -u root -p${MYSQL_ROOT_PASSWORD} mysql <<-END
CREATE DATABASE ${MYSQL_DB_DATABASE};
CREATE USER '${MYSQL_DB_USER}'@'localhost' IDENTIFIED BY '${MYSQL_DB_PASSWD}';
CREATE USER '${MYSQL_DB_USER}'@'%' IDENTIFIED BY '${MYSQL_DB_PASSWD}';
GRANT ALL PRIVILEGES ON ${MYSQL_DB_DATABASE}.* TO '${MYSQL_DB_USER}'@'localhost' WITH GRANT OPTION;
GRANT ALL PRIVILEGES ON ${MYSQL_DB_DATABASE}.* TO '${MYSQL_DB_USER}'@'%' WITH GRANT OPTION;
commit;
END

# Initialize schema
mysql -h ${MYSQL_DB_HOST} -u ${MYSQL_DB_USER} -p${MYSQL_DB_PASSWD} ${MYSQL_DB_DATABASE} < ${CCSDK_HOME}/config/schema.sql

# Install ssl and java certificates
COPY $CCSDK_CONFIG_DIR/truststoreONAPall.jks $JAVA_SECURITY_DIR
RUN keytool -importkeystore -srckeystore $JAVA_SECURITY_DIR/truststoreONAPall.jks -srcstorepass changeit -destkeystore $JAVA_SECURITY_DIR/cacerts  -deststorepass changeit

echo -e "\nCerts ready"

cd $CCSDK_HOME
java -DserviceLogicDirectory=${SVCLOGIC_DIR} -Dcadi_prop_files=${CCSDK_CONFIG_DIR}/org.onap.sdnc.props -Dserver.ssl.key-store=${CCSDK_CONFIG_DIR}/org.onap.sdnc.p12 -DLOG_PATH=${LOG_PATH} -jar ${CCSDK_HOME}/lib/${SLIBOOT_JAR}

