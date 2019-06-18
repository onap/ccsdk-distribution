# Base ubuntu with added packages needed for open ecomp
FROM onap/ccsdk-ubuntu-image:${project.docker.latestfulltag.version}
MAINTAINER CCSDK  Team (onap-discuss@lists.onap.org)

# Create non-root user
RUN addgroup --system dgbuilder && adduser --system --ingroup dgbuilder dgbuilder

# copy onap
COPY --chown=dgbuilder:dgbuilder opt /opt
WORKDIR /opt/onap/ccsdk/dgbuilder
# Set the proxy if needed
# RUN npm config set proxy http://your.proxy.com:8080
RUN cd /opt/onap/ccsdk/dgbuilder/ && npm install

#ENTRYPOINT /bin/bash /opt/onap/ccsdk/dgbuilder/start sdnc1.0

USER dgbuilder
EXPOSE 3100
