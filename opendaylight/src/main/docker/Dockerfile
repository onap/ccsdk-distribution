# Base ubuntu with added packages needed for open ecomp
FROM onap/ccsdk-ubuntu-image:${project.version}
MAINTAINER CCSDK Team (onap-ccsdk@lists.openecomp.org)
ENV JAVA_HOME /usr/lib/jvm/java-8-openjdk-amd64
ENV ODL_HOME /opt/opendaylight/current

# copy the opendaylight tar and expand
COPY distribution-karaf-${ccsdk.opendaylight.version}.tar.gz /tmp/
RUN mkdir /opt/opendaylight \
    && tar zxvf /tmp/distribution-karaf-${ccsdk.opendaylight.version}.tar.gz --directory /opt/opendaylight \
    && rm -rf /tmp/distribution-karaf-${ccsdk.opendaylight.version}.tar.gz \
    && ln -s /opt/opendaylight/distribution-karaf-${ccsdk.opendaylight.version} /opt/opendaylight/current


# workaround till we get proxy working
RUN mkdir -p /opt/opendaylight/current/system/mysql/mysql-connector-java/${ccsdk.mysql-connector-java.version}
COPY mysql-connector-java-${ccsdk.mysql-connector-java.version}.jar /opt/opendaylight/current/system/mysql/mysql-connector-java/${ccsdk.mysql-connector-java.version}
# ENTRYPOINT exec /opt/opendaylight/current/bin/karaf
EXPOSE 8181
