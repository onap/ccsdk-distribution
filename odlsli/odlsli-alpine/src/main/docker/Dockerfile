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
<<<<<<< HEAD   (80c695 Changing odlparent pom version adding few dependencies)
## END OF STAGE0 ##

FROM ${base.image.name}:${project.docker.latestfulltag.version}

LABEL maintainer="CCSDK Team (onap-ccsdk@lists.onap.org)"
USER root

ENV SDNC_CONFIG_DIR /opt/onap/ccsdk/data/properties
ENV CCSDKFEATUREVERSION ${ccsdk.features.version}
ENV CCSDK_SLI_CORE_REPO mvn:org.onap.ccsdk.sli.core/ccsdk-sli-core-all/${ccsdk.sli.version}/xml/features
ENV CCSDK_SLI_ADAPTORS_REPO mvn:org.onap.ccsdk.sli.adaptors/ccsdk-sli-adaptors-all/${ccsdk.sli.version}/xml/features
ENV CCSDK_FEATURES_REPO mvn:org.onap.ccsdk.features/ccsdk-features-all/${ccsdk.features.version}/xml/features
ENV CCSDK_FEATURES_SDNR_WT_REPO mvn:org.onap.ccsdk.features.sdnr.wt/sdnr-wt-feature-aggregator/${ccsdk.features.version}/xml/features,\
 mvn:org.onap.ccsdk.features.sdnr.wt/sdnr-wt-feature-aggregator-oauth/${ccsdk.features.version}/xml/features,\
 mvn:org.onap.ccsdk.features.sdnr.wt/sdnr-wt-feature-aggregator-devicemanager/${ccsdk.features.version}/xml/features,\
 mvn:org.onap.ccsdk.features.sdnr.wt/sdnr-wt-feature-aggregator-devicemanager-base/${ccsdk.features.version}/xml/features
ENV CCSDK_FEATURES_SDNR_NORTHBOUND_REPO mvn:org.onap.ccsdk.features.sdnr.northbound/sdnr-northbound-all/${ccsdk.features.version}/xml/features
ENV CCSDK_SLI_NORTHBOUND_REPO mvn:org.onap.ccsdk.sli.northbound/ccsdk-sli-northbound-all/${ccsdk.sli.version}/xml/features
ENV CCSDK_SLI_PLUGINS_REPO mvn:org.onap.ccsdk.sli.plugins/ccsdk-sli-plugins-all/${ccsdk.sli.version}/xml/features
ENV A1ADAPTER_NORTHBOUND_REPO mvn:org.onap.ccsdk.oran/a1-adapter-northbound/${ccsdk.oran.a1adapter.version}/xml/features
ENV ANSIBLE_GPG_KEY ${ansible.gpg.key}
ENV ODL_BOOT_FEATURES_EXTRA ${odl.boot.features.extra}

# Install sudo and IP utilities
RUN apk update && apk --no-cache add sudo iputils openssl



# Enable wheel group
RUN sed -e 's/# %wheel ALL=(ALL) NOPASSWD: ALL/%wheel ALL=(ALL) NOPASSWD: ALL/g' -i /etc/sudoers

# Create odl user
RUN addgroup -S odl && adduser -S odl -G odl
RUN addgroup odl wheel
=======

# CCSDK SLI FEATURES
ENV CCSDK_SLI_FEATURES_REPO mvn:org.onap.ccsdk.sli.core/ccsdk-sli-core-all/${ccsdk.sli.version}/xml/features,\
mvn:org.onap.ccsdk.sli.adaptors/ccsdk-sli-adaptors-all/${ccsdk.sli.version}/xml/features,\
mvn:org.onap.ccsdk.sli.northbound/ccsdk-sli-northbound-all/${ccsdk.sli.version}/xml/features,\
mvn:org.onap.ccsdk.sli.plugins/ccsdk-sli-plugins-all/${ccsdk.sli.version}/xml/features

# CCSDK SDNR FEATURES
ENV CCSDK_SDNR_FEATURES_REPO mvn:org.onap.ccsdk.oran/a1-adapter-northbound/${ccsdk.oran.a1adapter.version}/xml/features,\
mvn:org.onap.ccsdk.features/ccsdk-features-all/${ccsdk.features.version}/xml/features,\
mvn:org.onap.ccsdk.features.sdnr.northbound/sdnr-northbound-all/${ccsdk.features.version}/xml/features,\
mvn:org.onap.ccsdk.features.sdnr.wt/sdnr-wt-feature-aggregator/${ccsdk.features.version}/xml/features,\
mvn:org.onap.ccsdk.features.sdnr.wt/sdnr-wt-feature-aggregator-oauth/${ccsdk.features.version}/xml/features,\
mvn:org.onap.ccsdk.features.sdnr.wt/sdnr-wt-feature-aggregator-devicemanager/${ccsdk.features.version}/xml/features,\
mvn:org.onap.ccsdk.features.sdnr.wt/sdnr-wt-feature-aggregator-devicemanager-base/${ccsdk.features.version}/xml/features

# ODL and CCSDK SLI featuresBoot defined in pom.xml
ENV ODL_BOOT_FEATURES_EXTRA ${odl.boot.features.extra}

# Backing up existing karaf cfg and updating features boot and features repository
RUN cp $ODL_HOME/etc/org.apache.karaf.features.cfg $ODL_HOME/etc/org.apache.karaf.features.cfg.orig
RUN sed -i -e "\|featuresBoot[^a-zA-Z]|s|$|,${ODL_BOOT_FEATURES_EXTRA}|" $ODL_HOME/etc/org.apache.karaf.features.cfg
RUN sed -i -e "\|featuresRepositories|s|$|,${CCSDK_SLI_FEATURES_REPO},${CCSDK_SDNR_FEATURES_REPO} |" $ODL_HOME/etc/org.apache.karaf.features.cfg

# Enable wheel and create a group and user
RUN sed -i -e 's/# %wheel ALL=(ALL) NOPASSWD: ALL/%wheel ALL=(ALL) NOPASSWD: ALL/g' /etc/sudoers \
    && addgroup -S odl \
    && adduser -S odl -G odl \
    && addgroup odl wheel
>>>>>>> CHANGE (3d5582 Effort to reduce image size and layers)

# Changing ownership and permission of /opt
RUN chown -R odl:odl /opt && chmod -R 755 /opt

## END OF STAGE0 ##

#################################################

## This will create actual image
FROM scratch
LABEL maintainer="CCSDK Team (onap-ccsdk@lists.onap.org)"
USER root

ENV JAVA_HOME /opt/java/openjdk
ENV ODL_HOME /opt/opendaylight/current
ENV SDNC_CONFIG_DIR /opt/onap/ccsdk/data/properties
ENV ANSIBLE_GPG_KEY ${ansible.gpg.key}

# Copy Everything from stage0
COPY --from=stage0 / /

# Add CCSDK repositories to boot repositories
RUN cp $ODL_HOME/etc/org.apache.karaf.features.cfg $ODL_HOME/etc/org.apache.karaf.features.cfg.orig
RUN sed -i -e "\|featuresRepositories|s|$|, ${CCSDK_SLI_CORE_REPO}, ${CCSDK_SLI_ADAPTORS_REPO}, ${CCSDK_SLI_NORTHBOUND_REPO}, ${CCSDK_SLI_PLUGINS_REPO}, ${CCSDK_FEATURES_REPO}, ${A1ADAPTER_NORTHBOUND_REPO}, ${CCSDK_FEATURES_SDNR_NORTHBOUND_REPO}, ${CCSDK_FEATURES_SDNR_WT_REPO} |"  $ODL_HOME/etc/org.apache.karaf.features.cfg
RUN sed -i -e "\|featuresBoot[^a-zA-Z]|s|$|,${ODL_BOOT_FEATURES_EXTRA}|"  $ODL_HOME/etc/org.apache.karaf.features.cfg

USER odl
WORKDIR $ODL_HOME
ENTRYPOINT /opt/onap/ccsdk/bin/startODL.sh
