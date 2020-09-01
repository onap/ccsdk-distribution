#FROM centos:7
FROM onap/ccsdk-alpine-j11-image:${project.docker.latestfulltag.version}

USER root
RUN apk add git tmux vim salt-master salt-minion

#RUN yum clean all && \
#      yum install -y yum install epel-release && \
#      yum install -y https://repo.saltstack.com/yum/redhat/salt-repo-latest-2.el7.noarch.rpm && \
#      yum update -y && \
#      yum install -y sudo git tmux vim salt-master salt-minion && \
#      yum clean all

EXPOSE 4505 4506

# Create non root user
RUN addgroup -S saltstack && adduser -S saltstack -G saltstack
# RUN groupadd --system saltstack && useradd --system -g saltstack saltstack
RUN chown -R saltstack /etc/salt /var/log/salt
RUN mkdir /var/run/salt && chown saltstack:saltstack /var/run/salt
RUN mkdir /var/cache/salt && chown saltstack:saltstack /var/cache/salt

USER saltstack

# Run salt-master in foreground (not as a daemon)
ENTRYPOINT [ "/usr/bin/salt-master" ]