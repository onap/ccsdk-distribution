# Prepare stage for multistage image build
## START OF STAGE0 ##
FROM ${base.image.name}:${project.docker.latestfulltag.version} AS stage0

ENV JAVA_HOME /usr/lib/jvm/java-1.8-openjdk
ENV LOG_PATH /var/log/onap/ccsdk


# copy deliverables to opt
COPY opt /opt

## END OF STAGE0 ##


FROM ${base.image.name}:${project.docker.latestfulltag.version}

MAINTAINER CCSDK Team (onap-ccsdk@lists.onap.org)

ENV JAVA_HOME /usr/lib/jvm/java-1.8-openjdk
ENV CCSDK_HOME /opt/onap/ccsdk
ENV SLIBOOT_JAR ${ccsdk.sliboot.jar}
ENV SVCLOGIC_PROPERTIES /opt/onap/ccsdk/data/properties/svclogic.properties
ENV SVCLOGIC_DIR /opt/onap/ccsdk/svclogic/graphs
ENV LOG_PATH /var/log/onap/ccsdk

# Install sudo and IP utilities
RUN apk update && apk --no-cache add sudo iputils openssl


# Enable wheel group
RUN sed -e 's/# %wheel ALL=(ALL) NOPASSWD: ALL/%wheel ALL=(ALL) NOPASSWD: ALL/g' -i /etc/sudoers

# Create sli user
RUN addgroup -S sli && adduser -S sli -G sli
RUN addgroup sli wheel

COPY --from=stage0 --chown=sli:sli /opt /opt
RUN mkdir -p ${LOG_PATH} && chown sli:sli ${LOG_PATH}


USER sli
WORKDIR ${CCSDK_HOME}
ENTRYPOINT java -DserviceLogicDirectory=${SVCLOGIC_DIR} -jar ${CCSDK_HOME}/lib/${SLIBOOT_JAR}
EXPOSE 8080
