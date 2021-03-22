# Base standard ONAP java base image with added packages needed for nodered
FROM onap/ccsdk-alpine-j11-image:${project.docker.latestfulltag.version}
MAINTAINER CCSDK  Team (onap-discuss@lists.onap.org)

USER root

RUN addgroup -S dgbuilder && adduser -S dgbuilder -G dgbuilder \
    && apk --no-cache add curl \
    && apk add gcc g++ make ncurses \
    && apk update && apk add yarn nodejs \
    && node --version

COPY --chown=dgbuilder:dgbuilder opt /opt

WORKDIR /opt/onap/ccsdk/dgbuilder

# Set the proxy if needed
# RUN npm config set proxy http://your.proxy.com:8080
RUN cd /opt/onap/ccsdk/dgbuilder/ && npm config set strict-ssl false && npm install

#ENTRYPOINT /bin/bash /opt/onap/ccsdk/dgbuilder/start sdnc1.0
USER dgbuilder
EXPOSE 3100
