FROM onap/ccsdk-alpine-j11-image:${project.docker.latestfulltag.version}

ENV ODL_HOME /opt/opendaylight/current

# copy the opendaylight tar and expand
COPY ${odl.karaf.artifactId}-${ccsdk.opendaylight.version}.tar.gz /tmp/
RUN mkdir -p /opt/odl \
    && tar zxvf /tmp/${odl.karaf.artifactId}-${ccsdk.opendaylight.version}.tar.gz --directory /opt/odl \
    && rm -rf /tmp/${odl.karaf.artifactId}-${ccsdk.opendaylight.version}.tar.gz \
    && mv /opt/odl/${odl.karaf.artifactId}-${ccsdk.opendaylight.version} /opt/opendaylight \
    && ln -s  /opt/opendaylight /opt/opendaylight/${odl.karaf.artifactId}-${ccsdk.opendaylight.version} \
    && ln -s /opt/opendaylight /opt/opendaylight/current

EXPOSE 8181
