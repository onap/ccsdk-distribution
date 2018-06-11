# Base ubuntu with added packages needed for open ecomp
FROM onap/ccsdk-ubuntu-image:${project.version}
MAINTAINER CCSDK Team (onap-ccsdk@lists.onap.org)
ENV JAVA_HOME /usr/lib/jvm/java-8-openjdk-amd64
ENV ODL_HOME /opt/opendaylight/current

# copy the opendaylight tar and expand
COPY karaf-${ccsdk.opendaylight.version}.tar.gz /tmp/
RUN mkdir /opt/opendaylight \
    && tar zxvf /tmp/karaf-${ccsdk.opendaylight.version}.tar.gz --directory /opt/opendaylight \
    && rm -rf /tmp/karaf-${ccsdk.opendaylight.version}.tar.gz \
    && mv /opt/opendaylight/karaf-${ccsdk.opendaylight.version} /opt/opendaylight/current \
    && ln -s  /opt/opendaylight/current /opt/opendaylight/karaf-${ccsdk.opendaylight.version}

# workaround till we get proxy working
RUN mkdir -p /opt/opendaylight/current/system/org/mariadb/jdbc/mariadb-java-client/${ccsdk.mariadb-connector-java.version}
COPY mariadb-java-client-${ccsdk.mariadb-connector-java.version}.jar /opt/opendaylight/current/system/org/mariadb/jdbc/mariadb-java-client/${ccsdk.mariadb-connector-java.version}
# ENTRYPOINT exec /opt/opendaylight/current/bin/karaf
EXPOSE 8181
