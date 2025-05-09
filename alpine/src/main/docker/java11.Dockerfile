# Base alpine with added packages needed for open ecomp
ARG OPENJDK_IMAGE_VERSION
FROM ${openjdk.image}:${openjdk11.image.version}

LABEL maintainer="ONAP CCSDK team"
LABEL Description="Reference CCSDK JAVA image based on alpine"

# Explicitly become root during build phase
USER root

ENV JAVA_OPTS="-Xms256m -Xmx1g"
ENV JAVA_SEC_OPTS=""

ARG HTTP_PROXY=${HTTP_PROXY}
ARG user=onap
ARG group=onap

# Install additional tools
RUN apk add --no-cache openssl ca-certificates

# Copy any certs
COPY *.md *.pem /etc/ssl/certs/

# Install certs
RUN update-ca-certificates

# Add additional packages if defined
RUN test -n "${openjdk.additional.packages}" && \
    export http_proxy=${HTTP_PROXY} && export https_proxy=${HTTP_PROXY} && \
    export HTTP_PROXY=${HTTP_PROXY} && export HTTPS_PROXY=${HTTP_PROXY} && \
    apk update && \
    apk --no-cache add ${openjdk.additional.packages} && \
    unset http_proxy && unset https_proxy && unset HTTP_PROXY && unset HTTPS_PROXY \
    || echo "No additional packages to install"

# Create a group and user
RUN addgroup -S $group && adduser -G $group -D $user && \
    mkdir /var/log/$user && \
    mkdir /app && \
    chown -R $user:$group /var/log/$user && \
    chown -R $user:$group /app

# Tell docker that all future commands should be run as the onap user
USER $user
WORKDIR /app

ENTRYPOINT exec java $JAVA_SEC_OPTS $JAVA_OPTS -jar /app/app.jar
