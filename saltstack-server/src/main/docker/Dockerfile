FROM onap/ccsdk-alpine-j11-image:${project.docker.latestfulltag.version}
LABEL maintainer="SDN-C Team (sdnc@lists.openecomp.org)"
USER root

RUN apk add git tmux vim salt-master salt-minion

#RUN yum clean all && \
#      yum install -y yum install epel-release && \
#      yum install -y https://repo.saltstack.com/yum/redhat/salt-repo-latest-2.el7.noarch.rpm && \
#      yum update -y && \
#      yum install -y sudo git tmux vim salt-master salt-minion && \
#      yum clean all

# Create non root user
RUN addgroup -S saltstack && adduser -S saltstack -G saltstack \
    && mkdir -p /var/run/salt /var/cache/salt && chown saltstack:saltstack \
    && chown -R saltstack /etc/salt /var/log/salt /var/run/salt /var/cache/salt


USER saltstack
EXPOSE 4505 4506
ENTRYPOINT [ "/usr/bin/salt-master" ]
