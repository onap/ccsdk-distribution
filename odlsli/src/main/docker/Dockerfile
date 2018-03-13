# Base ubuntu with added packages needed for open ecomp
FROM onap/ccsdk-odl-image:${project.version}
MAINTAINER CCSDK Team (onap-ccsdk@lists.openecomp.org)
ENV JAVA_HOME /usr/lib/jvm/java-8-openjdk-amd64
ENV ODL_HOME /opt/opendaylight/current
ENV SDNC_CONFIG_DIR /opt/onap/ccsdk/data/properties

# copy the opendaylight credentials
COPY idmlight.db.mv.db /opt/opendaylight/current

# copy deliverables to opt
COPY opt /opt

COPY org.ops4j.pax.logging.cfg /opt/opendaylight/current/etc/org.ops4j.pax.logging.cfg

# ENTRYPOINT exec /opt/opendaylight/current/bin/karaf
EXPOSE 8181
