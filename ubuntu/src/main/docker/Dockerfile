# Base ubuntu with added packages needed for open ecomp
FROM docker.io/ubuntu:16.04
MAINTAINER CCSDK  Team (onap-ccsdk@lists.onap.org)



# Add tools needed for OpenDaylight
RUN apt-get update && apt-get install -y git openjdk-8-jdk maven mysql-client nodejs nodejs-legacy python-pip graphviz npm unzip
