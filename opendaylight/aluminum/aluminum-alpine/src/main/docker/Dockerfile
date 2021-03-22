# Prepare stage for multistage image build
## START OF STAGE0 ##
FROM onap/ccsdk-alpine-j11-image:${project.docker.latestfulltag.version} AS stage0
USER root

ENV ODL_HOME /opt/opendaylight/current

# copy the opendaylight tar and expand
COPY ${odl.karaf.artifactId}-${ccsdk.opendaylight.version}.tar.gz /tmp/
RUN mkdir -p /opt/odl \
    && tar zxvf /tmp/${odl.karaf.artifactId}-${ccsdk.opendaylight.version}.tar.gz --directory /opt/odl \
    && rm -rf /tmp/${odl.karaf.artifactId}-${ccsdk.opendaylight.version}.tar.gz \
    && mv /opt/odl/${odl.karaf.artifactId}-${ccsdk.opendaylight.version} /opt/opendaylight \
    && ln -s  /opt/opendaylight /opt/opendaylight/${odl.karaf.artifactId}-${ccsdk.opendaylight.version} \
    && ln -s /opt/opendaylight /opt/opendaylight/current

# Patch some opendaylight artifacts
COPY system $ODL_HOME/system
# Add missing scripts see SDNC-1056
#COPY configure_cluster.sh configure-cluster-ipdetect.sh custom_shard_config.txt set_persistence.sh $ODL_HOME/bin/
#RUN chmod 755 $ODL_HOME/bin/configure_cluster.sh $ODL_HOME/bin/configure-cluster-ipdetect.sh $ODL_HOME/bin/set_persistence.sh $ODL_HOME/bin/custom_shard_config.txt

## END OF STAGE0 ##


## This will create actual image
FROM onap/ccsdk-alpine-j11-image:${project.docker.latestfulltag.version}
MAINTAINER CCSDK Team (onap-ccsdk@lists.onap.org)
USER root

ENV ODL_HOME /opt/opendaylight/current

COPY --from=stage0 /opt /opt

# ENTRYPOINT exec /opt/opendaylight/bin/karaf
WORKDIR $ODL_HOME
USER onap
EXPOSE 8181
