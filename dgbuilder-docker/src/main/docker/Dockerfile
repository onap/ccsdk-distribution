# Base ubuntu with added packages needed for open ecomp
FROM onap/ccsdk-ubuntu-image:${project.docker.latestfulltag.version}
MAINTAINER CCSDK  Team (onap-discuss@lists.onap.org)

# Create non-root user
RUN addgroup --system dgbuilder && adduser --system --ingroup dgbuilder dgbuilder
RUN apt-get update && apt-get install -y curl
RUN curl -sL https://deb.nodesource.com/setup_10.x | bash -
RUN apt-get install gcc g++ make
RUN curl -sL https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" |tee /etc/apt/sources.list.d/yarn.list
# copy onap
COPY --chown=dgbuilder:dgbuilder opt /opt
RUN apt-get update && apt-get install -y yarn nodejs
RUN node --version
WORKDIR /opt/onap/ccsdk/dgbuilder
# Set the proxy if needed
# RUN npm config set proxy http://your.proxy.com:8080
RUN cd /opt/onap/ccsdk/dgbuilder/ && npm install

#ENTRYPOINT /bin/bash /opt/onap/ccsdk/dgbuilder/start sdnc1.0

USER dgbuilder
EXPOSE 3100

