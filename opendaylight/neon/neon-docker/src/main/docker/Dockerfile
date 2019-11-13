FROM onap/ccsdk-alpine-image:${project.docker.latestfulltag.version}
MAINTAINER CCSDK Team (onap-ccsdk@lists.onap.org)
ENV JAVA_HOME /usr/lib/jvm/java-1.8-openjdk
ENV ODL_HOME /opt/opendaylight/current

# make python2 also available up until OpenDaylight migrates to python3
RUN apk add --no-cache py2-pip

# copy the opendaylight tar and expand
COPY karaf-${ccsdk.opendaylight.version}.tar.gz /tmp/
RUN mkdir -p /opt/odl \
    && tar zxvf /tmp/karaf-${ccsdk.opendaylight.version}.tar.gz --directory /opt/odl \
    && rm -rf /tmp/karaf-${ccsdk.opendaylight.version}.tar.gz \
    && mv /opt/odl/karaf-${ccsdk.opendaylight.version} /opt/opendaylight \
    && ln -s  /opt/opendaylight /opt/opendaylight/karaf-${ccsdk.opendaylight.version} \
    && ln -s /opt/opendaylight /opt/opendaylight/current

# workaround till we get proxy working
RUN mkdir -p /opt/opendaylight/system/org/mariadb/jdbc/mariadb-java-client/${ccsdk.mariadb-connector-java.version}
COPY mariadb-java-client-${ccsdk.mariadb-connector-java.version}.jar /opt/opendaylight/system/org/mariadb/jdbc/mariadb-java-client/${ccsdk.mariadb-connector-java.version}

# ENTRYPOINT exec /opt/opendaylight/bin/karaf
EXPOSE 8181
