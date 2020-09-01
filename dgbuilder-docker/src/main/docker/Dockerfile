# Base standard ONAP java base image with added packages needed for nodered
FROM onap/ccsdk-alpine-j11-image:${project.docker.latestfulltag.version}
MAINTAINER CCSDK  Team (onap-discuss@lists.onap.org)

# Create non-root user
USER root
RUN addgroup -S dgbuilder && adduser -S dgbuilder -G dgbuilder

RUN apk --no-cache add curl
RUN curl -sL https://deb.nodesource.com/setup_10.x | bash -
RUN apk add gcc g++ make ncurses

# copy onap
COPY --chown=dgbuilder:dgbuilder opt /opt
RUN apk update && apk add yarn nodejs
RUN node --version
WORKDIR /opt/onap/ccsdk/dgbuilder
# Set the proxy if needed
# RUN npm config set proxy http://your.proxy.com:8080
RUN cd /opt/onap/ccsdk/dgbuilder/ && npm config set strict-ssl false && npm install

#ENTRYPOINT /bin/bash /opt/onap/ccsdk/dgbuilder/start sdnc1.0

USER dgbuilder
EXPOSE 3100

