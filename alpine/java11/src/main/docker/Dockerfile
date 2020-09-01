# Base alpine with added packages needed for open ecomp
FROM alpine:3.11.3

LABEL maintainer="CCSDK  Team (onap-ccsdk@lists.onap.org)"

RUN apk add --no-cache openjdk11 python3 graphviz unzip rsync nss mysql-client nodejs
ARG HTTP_PROXY
ARG HTTPS_PROXY

ENV HTTP_PROXY  ${HTTP_PROXY}
ENV http_proxy  ${HTTP_PROXY}
ENV HTTPS_PROXY ${HTTPS_PROXY}
ENV https_proxy ${HTTPS_PROXY}

ENV JAVA_HOME /usr/lib/jvm/java-11-openjdk