# Base ubuntu with added packages needed for open ecomp
FROM onap/ccsdk-ubuntu-image:${ccsdk.distribution.version}

LABEL maintainer="SDN-C Team (sdnc@lists.openecomp.org)"

#ENV http_proxy=http://anonymous:password@one.proxy.att.com:8080
#ENV https_proxy=http://anonymous:password@one.proxy.att.com:8080

##Vim
RUN apt-get update
RUN apt-get -y install apt-file
RUN apt-file update
RUN apt-get -y install vim

##Python:
RUN apt-get -y install python2.7
RUN apt-get -y install python-pip



# copy files needed
COPY opt /opt/

WORKDIR /opt/onap/sdnc

#ENTRYPOINT exec startAnsibleServer.sh
#CMD ["/bin/bash"]
EXPOSE 8000

