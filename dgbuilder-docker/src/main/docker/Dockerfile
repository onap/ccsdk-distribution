# Base standard ONAP java base image with added packages needed for nodered
FROM onap/ccsdk-alpine-j11-image:${project.docker.latestfulltag.version}
MAINTAINER CCSDK  Team (onap-discuss@lists.onap.org)
USER root

RUN addgroup -S dgbuilder && adduser -S dgbuilder -G dgbuilder \
    && apk update && apk --no-cache add curl gcc g++ make ncurses yarn nodejs \
    && node --version

COPY --chown=dgbuilder:dgbuilder opt /opt

# Set the proxy if needed
# RUN npm config set proxy http://your.proxy.com:8080
RUN cd /opt/onap/ccsdk/dgbuilder && npm config set strict-ssl false && npm install

USER dgbuilder
EXPOSE 3100
WORKDIR /opt/onap/ccsdk/dgbuilder
#ENTRYPOINT /bin/bash /opt/onap/ccsdk/dgbuilder/start sdnc1.0
