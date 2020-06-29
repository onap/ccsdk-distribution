# Base alpine with added packages needed for open ecomp
FROM alpine:3.12
MAINTAINER CCSDK  Team (onap-ccsdk@lists.onap.org)

ARG HTTP_PROXY
ARG HTTPS_PROXY

ENV HTTP_PROXY  ${HTTP_PROXY}
ENV http_proxy  ${HTTP_PROXY}
ENV HTTPS_PROXY ${HTTPS_PROXY}
ENV https_proxy ${HTTPS_PROXY}

ENV JAVA_HOME /usr/lib/jvm/java-11-openjdk
# Add tools needed for OpenDaylight
RUN apk --no-cache add openjdk11 --repository=http://dl-cdn.alpinelinux.org/alpine/edge/community \
  && apk update && apk --no-cache add bash git openjdk11 maven mysql-client nodejs python3 graphviz unzip rsync nss