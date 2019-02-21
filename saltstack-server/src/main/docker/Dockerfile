FROM centos:7


RUN yum clean all && \
      yum install -y yum install epel-release && \
      yum install -y https://repo.saltstack.com/yum/redhat/salt-repo-latest-2.el7.noarch.rpm && \
      yum update -y && \
      yum install -y sudo git tmux vim salt-master salt-minion && \
      yum clean all

EXPOSE 4505 4506

# Create non root user
RUN groupadd --system saltstack && useradd --system -g saltstack saltstack
RUN chown -R saltstack /etc/salt /var/cache/salt /var/log/salt
RUN mkdir /var/run/salt && chown saltstack:saltstack /var/run/salt

USER saltstack

# Run salt-master in foreground (not as a daemon)
CMD /usr/bin/salt-master