# Base alpine with added packages needed for open ecomp
FROM ${base.image}:${base.image.version}
MAINTAINER CCSDK  Team (onap-ccsdk@lists.onap.org)
USER root

ARG HTTP_PROXY
ARG HTTPS_PROXY
ARG NO_PROXY

ENV HTTP_PROXY ${HTTP_PROXY}
ENV http_proxy ${HTTP_PROXY}
ENV HTTPS_PROXY ${HTTPS_PROXY}
ENV https_proxy ${HTTPS_PROXY}
ENV NO_PROXY ${NO_PROXY}
ENV no_proxy ${NO_PROXY}

ENV JAVA_HOME /opt/java/openjdk

# Copy any certs
COPY *.md *.pem /etc/ssl/certs/

# Install certs
RUN update-ca-certificates

RUN echo "http_proxy = $http_proxy" && echo "https_proxy = $https_proxy" && echo "no_proxy = $no_proxy" &&  echo "HTTP_PROXY = $HTTP_PROXY" &&  echo "HTTPS_PROXY = $HTTPS_PROXY" && echo "NO_PROXY = $NO_PROXY"

# Add tools needed for OpenDaylight
RUN apk update && apk --no-cache add sudo bash iputils openssl git mysql-client nodejs npm python3 py3-pip graphviz unzip rsync nss

USER onap
