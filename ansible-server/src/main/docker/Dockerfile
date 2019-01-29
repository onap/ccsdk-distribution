# Base ubuntu with added packages needed for open ecomp
FROM onap/ccsdk-alpine-image:${ccsdk.distribution.version}

LABEL maintainer="SDN-C Team (sdnc@lists.openecomp.org)"

#ENV http_proxy=http://anonymous:password@one.proxy.att.com:8080
#ENV https_proxy=http://anonymous:password@one.proxy.att.com:8080

## add more pkgs
RUN apk update
RUN apk add vim
RUN apk add curl

# copy files needed
COPY opt /opt/

WORKDIR /opt/onap/ccsdk

#ENTRYPOINT exec startAnsibleServer.sh
#CMD ["/bin/bash"]
EXPOSE 8000

