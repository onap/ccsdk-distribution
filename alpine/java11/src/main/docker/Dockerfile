# Base alpine with added packages needed for open ecomp
FROM ${base.image}:${base.image.version}
MAINTAINER CCSDK  Team (onap-ccsdk@lists.onap.org)

ARG HTTP_PROXY
ARG HTTPS_PROXY

ENV HTTP_PROXY  ${HTTP_PROXY}
ENV http_proxy  ${HTTP_PROXY}
ENV HTTPS_PROXY ${HTTPS_PROXY}
ENV https_proxy ${HTTPS_PROXY}

ENV JAVA_HOME /opt/java/openjdk
# Add tools needed for OpenDaylight
USER root
RUN apk update && apk --no-cache add bash git  mysql-client nodejs npm python3 py3-pip graphviz unzip rsync nss
USER onap