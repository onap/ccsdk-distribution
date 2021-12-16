# Prepare stage for multistage image build
## START OF STAGE0 ##
FROM onap/ccsdk-alpine-j11-image:${project.docker.latestfulltag.version} AS stage0
USER root

ENV ODL_HOME /opt/opendaylight/current

# copy the opendaylight tar and expand
COPY ${odl.karaf.artifactId}-${ccsdk.opendaylight.version}.tar.gz /tmp/
RUN mkdir -p /opt/odl \
    && tar xzf /tmp/${odl.karaf.artifactId}-${ccsdk.opendaylight.version}.tar.gz --directory /opt/odl \
    && rm -rf /tmp/${odl.karaf.artifactId}-${ccsdk.opendaylight.version}.tar.gz \
    && mv /opt/odl/${odl.karaf.artifactId}-${ccsdk.opendaylight.version} /opt/opendaylight \
    && ln -s  /opt/opendaylight /opt/opendaylight/${odl.karaf.artifactId}-${ccsdk.opendaylight.version} \
    && ln -s /opt/opendaylight /opt/opendaylight/current

# Enable wheel and create a group and user
RUN sed -i -e 's/# %wheel ALL=(ALL) NOPASSWD: ALL/%wheel ALL=(ALL) NOPASSWD: ALL/g' /etc/sudoers \
    && addgroup -S odl \
    && adduser -S odl -G odl \
    && addgroup odl wheel

# Patch some opendaylight artifacts
COPY system $ODL_HOME/system

# Add missing scripts see SDNC-1056
#COPY configure_cluster.sh configure-cluster-ipdetect.sh custom_shard_config.txt set_persistence.sh $ODL_HOME/bin/
#RUN chmod 755 $ODL_HOME/bin/configure_cluster.sh $ODL_HOME/bin/configure-cluster-ipdetect.sh $ODL_HOME/bin/set_persistence.sh $ODL_HOME/bin/custom_shard_config.txt


# Remove vulnerable version of ops4j logging
COPY framework-${odl.karaf.framework.version}-features.xml $ODL_HOME/system/org/apache/karaf/features/framework/${odl.karaf.framework.version}/framework-${odl.karaf.framework.version}-features.xml
COPY startup.properties $ODL_HOME/etc/startup.properties
RUN rm -rf $ODL_HOME/system/org/ops4j/pax/logging/pax-logging-log4j2/${odl.pax.logging.version}
RUN rm -rf $ODL_HOME/system/org/ops4j/pax/logging/pax-logging-logback/${odl.pax.logging.version}
RUN rm -rf $ODL_HOME/system/org/ops4j/pax/logging/pax-logging-api/${odl.pax.logging.version}

# Changing ownership and permission of /opt
RUN chown -R odl:odl /opt && chmod -R 755 /opt

## END OF STAGE0 ##

#################################################

## This will create actual image
FROM scratch
MAINTAINER CCSDK Team (onap-ccsdk@lists.onap.org)
USER root

ENV JAVA_HOME=/opt/java/openjdk \
    PATH=$PATH:/opt/java/openjdk/bin \
    ODL_HOME=/opt/opendaylight/current

# Copy Everything from stage0
COPY --from=stage0 / /

USER odl
EXPOSE 8181
WORKDIR $ODL_HOME
# ENTRYPOINT exec /opt/opendaylight/bin/karaf
