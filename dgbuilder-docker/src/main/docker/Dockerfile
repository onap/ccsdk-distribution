# Base ubuntu with added packages needed for open ecomp
FROM onap/ccsdk-ubuntu-image:${project.docker.latestfulltag.version}
MAINTAINER CCSDK  Team (onap-discuss@lists.onap.org)

# copy onap
COPY opt /opt
WORKDIR /opt/onap/ccsdk/dgbuilder
# Set the proxy if needed
# RUN npm config set proxy http://your.proxy.com:8080
#RUN npm install

#ENTRYPOINT /bin/bash /opt/onap/ccsdk/dgbuilder/start sdnc1.0
EXPOSE 3100
