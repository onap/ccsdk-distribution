# Prepare stage for multistage image build
## START OF STAGE0 ##
FROM ${base.image.name}:${project.docker.latestfulltag.version} AS stage0
USER root

# Copy the opendaylight credentials
COPY idmlight.db.mv.db $ODL_HOME/data

# Copy CCSDK mvn artifacts to ODL repository
COPY system /tmp/system
RUN rsync -a /tmp/system $ODL_HOME

# Copy deliverables to opt
COPY opt /opt
COPY org.ops4j.pax.logging.cfg $ODL_HOME/etc/org.ops4j.pax.logging.cfg

# Backing up existing karaf cfg and updating features boot and features repositories defined in pom.xml
RUN cp $ODL_HOME/etc/org.apache.karaf.features.cfg $ODL_HOME/etc/org.apache.karaf.features.cfg.orig
RUN sed -i -e "\|featuresBoot[^a-zA-Z]|s|$|,${extra.odl.features},${ccsdk.sli.features}|" $ODL_HOME/etc/org.apache.karaf.features.cfg
RUN sed -i -e "\|featuresRepositories|s|$|,${ccsdk.sli.features.repo}|" $ODL_HOME/etc/org.apache.karaf.features.cfg

# Changing ownership and permission of /opt
RUN chown -R odl:odl /opt && chmod -R 755 /opt

## END OF STAGE0 ##

#################################################

## This will create actual image
FROM scratch
LABEL maintainer="CCSDK Team (onap-ccsdk@lists.onap.org)"
USER root

ENV JAVA_HOME /opt/java/openjdk
ENV PATH $PATH:/opt/java/openjdk/bin

ENV ODL_HOME /opt/opendaylight/current
ENV SDNC_CONFIG_DIR /opt/onap/ccsdk/data/properties
ENV ANSIBLE_GPG_KEY ${ansible.gpg.key}

# Copy Everything from stage0
COPY --from=stage0 / /

USER odl
WORKDIR $ODL_HOME
ENTRYPOINT /opt/onap/ccsdk/bin/startODL.sh
