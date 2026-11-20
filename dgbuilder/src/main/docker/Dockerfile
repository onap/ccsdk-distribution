# Node-RED 0.9.1 and its Express 3 stack do not run on Node.js 23+ (util.log
# and res._headers were removed), so stay on the Node 22 line rather than
# node:lts-alpine.
FROM node:22-alpine AS build

COPY opt /opt

# Set the proxy if needed
# RUN npm config set proxy http://your.proxy.com:8080
RUN cd /opt/onap/ccsdk/dgbuilder && npm config set strict-ssl false && npm install --omit=dev

FROM node:22-alpine
MAINTAINER CCSDK  Team (onap-discuss@lists.onap.org)
USER root

# Java is needed by svclogic/svclogic.sh, which loads and activates the
# directed graphs in the SLI database.
ENV JAVA_HOME=/opt/java/openjdk
ENV PATH=/opt/java/openjdk/bin:$PATH
COPY --from=eclipse-temurin:21-jre-alpine /opt/java/openjdk /opt/java/openjdk

RUN apk add --no-cache bash curl ncurses git graphviz python3 unzip \
    && apk upgrade --no-cache \
    && addgroup -S dgbuilder && adduser -S dgbuilder -G dgbuilder \
    && node --version && java -version

COPY --from=build --chown=dgbuilder:dgbuilder /opt /opt

USER dgbuilder
EXPOSE 3100
WORKDIR /opt/onap/ccsdk/dgbuilder
#ENTRYPOINT /bin/bash /opt/onap/ccsdk/dgbuilder/start sdnc1.0
