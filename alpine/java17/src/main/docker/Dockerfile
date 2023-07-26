# Base alpine with added packages needed for open ecomp
FROM ${base.image}:${base.image.version}
MAINTAINER CCSDK  Team (onap-ccsdk@lists.onap.org)
USER root

ARG http_proxy
ARG https_proxy
ARG no_proxy

ENV HTTP_PROXY $http_proxy
ENV http_proxy $http_proxy
ENV HTTPS_PROXY $https_proxy
ENV https_proxy $https_proxy
ENV NO_PROXY $no_proxy
ENV no_proxy $no_proxy

ENV JAVA_HOME /opt/java/openjdk

# Copy any certs
COPY *.md *.pem /etc/ssl/certs/

# Install certs
RUN update-ca-certificates

RUN echo "http_proxy = $http_proxy"
RUN echo "https_proxy = $https_proxy"
RUN echo "no_proxy = $no_proxy"
RUN echo "HTTP_PROXY = $HTTP_PROXY"
RUN echo "HTTPS_PROXY = $HTTPS_PROXY"
RUN echo "NO_PROXY = $NO_PROXY"

# Add tools needed for OpenDaylight
RUN apk update && apk --no-cache add sudo bash iputils openssl git mysql-client nodejs npm python3 py3-pip graphviz unzip rsync nss

USER onap
