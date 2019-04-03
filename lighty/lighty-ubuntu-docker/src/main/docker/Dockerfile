# Base ubuntu with added packages needed for open ecomp
FROM onap/ccsdk-ubuntu-image:${project.docker.latestfulltag.version}
MAINTAINER CCSDK Team (onap-ccsdk@lists.onap.org)
ENV JAVA_HOME /usr/lib/jvm/java-8-openjdk-amd64
ENV ODL_HOME /opt/opendaylight/current

# copy the opendaylight tar and expand
COPY ${lighty.app.zip} /tmp/lighty/
RUN mkdir -p /opt/lighty \
    && unzip /tmp/lighty/${lighty.app.zip} -d /opt/lighty \
    && rm -rf /tmp/lighty

# workaround till we get proxy working
RUN mkdir -p /opt/opendaylight/system/org/mariadb/jdbc/mariadb-java-client/${ccsdk.mariadb-connector-java.version}
COPY mariadb-java-client-${ccsdk.mariadb-connector-java.version}.jar /opt/opendaylight/system/org/mariadb/jdbc/mariadb-java-client/${ccsdk.mariadb-connector-java.version}


COPY opt /opt

ENTRYPOINT /opt/onap/ccsdk/bin/startODL.sh
EXPOSE 8181
