# Base ubuntu with added packages needed for open ecomp
FROM onap/ccsdk-ubuntu-image:${project.docker.latestfulltag.version}
MAINTAINER CCSDK Team (onap-ccsdk@lists.onap.org)
ENV JAVA_HOME /usr/lib/jvm/java-8-openjdk-amd64
ENV ODL_HOME /opt/opendaylight/current

# copy the opendaylight tar and expand
#COPY karaf-${ccsdk.opendaylight.version}.tar.gz /tmp/
#RUN mkdir /opt/odl \
#    && tar zxvf /tmp/karaf-${ccsdk.opendaylight.version}.tar.gz --directory /opt/odl \
#    && rm -rf /tmp/karaf-${ccsdk.opendaylight.version}.tar.gz \
#    && mv /opt/odl/karaf-${ccsdk.opendaylight.version} /opt/opendaylight \
#    && ln -s  /opt/opendaylight /opt/opendaylight/karaf-${ccsdk.opendaylight.version} \
#    && ln -s /opt/opendaylight /opt/opendaylight/current


# copy the opendaylight tar and expand
COPY ${lighty.app.zip} /tmp/lighty/
#RUN mkdir /opt/lighty \
#    && unzip /tmp/lighty/${lighty.app.zip} -d /tmp/lighty \
#    && mv /tmp/lighty/${lighty.app.name} /opt/lighty \
#    && rm -rf /tmp/lighty

RUN mkdir /opt/lighty
RUN unzip /tmp/lighty/${lighty.app.zip} -d /opt/lighty
RUN rm -rf /tmp/lighty

# workaround till we get proxy working
RUN mkdir -p /opt/opendaylight/system/org/mariadb/jdbc/mariadb-java-client/${ccsdk.mariadb-connector-java.version}
COPY mariadb-java-client-${ccsdk.mariadb-connector-java.version}.jar /opt/opendaylight/system/org/mariadb/jdbc/mariadb-java-client/${ccsdk.mariadb-connector-java.version}

#RUN useradd odl

COPY opt /opt

ENTRYPOINT /opt/onap/ccsdk/bin/startODL.sh
EXPOSE 8181
