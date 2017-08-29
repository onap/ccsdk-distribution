# Base ubuntu with added packages needed for open ecomp
FROM onap/ccsdk-ubuntu-image:${project.version}
MAINTAINER CCSDK  Team (onap-ccsdk@lists.onap.org)

# copy onap
COPY opt /opt
WORKDIR /opt/onap/sdnc/dgbuilder
# Set the proxy if needed
# RUN npm config set proxy http://your.proxy.com:8080
#RUN npm install

#ENTRYPOINT /bin/bash /opt/onap/sdnc/dgbuilder/start sdnc1.0
EXPOSE 3100
