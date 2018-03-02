#!/bin/bash
#echo "PROJECT_HOME:$PROJECT_HOME"

MYSQL_JDBC_DRIVER=${MYSQL_JDBC_DRIVER:-$PROJECT_HOME/svclogic/lib/mysql-connector-java-5.1.31.jar}
JARDIR="$PROJECT_HOME/svclogic/lib"
#JARDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

CLASSPATH=$CLASSPATH:$MYSQL_JDBC_DRIVER
for jar in $JARDIR/*.jar
do
    CLASSPATH=$CLASSPATH:${jar}
done
#echo "CLASSPATH is ${CLASSPATH}"
java  -Dorg.slf4j.simpleLogger.showDateTime=true -Dorg.slf4j.simpleLogger.dateTimeFormat="yyyy-MM-dd HH:mm:ss" -cp ${CLASSPATH}:${MYSQL_JDBC_DRIVER}:${SLI_COMMON_JAR} org.onap.ccsdk.sli.core.sli.SvcLogicParser $*
