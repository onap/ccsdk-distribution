# Prepare stage for multistage image build
## START OF STAGE0 ##
FROM onap/ccsdk-alpine-image:${project.docker.latestfulltag.version} AS stage0

# Add the opendaylight's karaf and expand
ADD karaf-${ccsdk.opendaylight.version}.tar.gz /opt/odl
RUN mv /opt/odl/karaf-${ccsdk.opendaylight.version} /opt/opendaylight \
 && ln -s  /opt/opendaylight /opt/opendaylight/karaf-${ccsdk.opendaylight.version} \
 && ln -s /opt/opendaylight /opt/opendaylight/current \
 && rmdir /opt/odl
## END OF STAGE0 ##


FROM onap/ccsdk-alpine-image:${project.docker.latestfulltag.version}

MAINTAINER CCSDK Team (onap-ccsdk@lists.onap.org)

ENV JAVA_HOME /usr/lib/jvm/java-1.8-openjdk
ENV ODL_HOME /opt/opendaylight/current

# Create odl user
RUN addgroup -S odl
RUN adduser -S odl -G odl
RUN addgroup odl wheel

COPY --from=stage0 --chown=odl:odl /opt /opt

# workaround till we get proxy working
RUN mkdir -p /opt/opendaylight/system/org/mariadb/jdbc/mariadb-java-client/${ccsdk.mariadb-connector-java.version}
COPY mariadb-java-client-${ccsdk.mariadb-connector-java.version}.jar /opt/opendaylight/system/org/mariadb/jdbc/mariadb-java-client/${ccsdk.mariadb-connector-java.version}

# ENTRYPOINT exec /opt/opendaylight/bin/karaf
EXPOSE 8181
