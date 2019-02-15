FROM centos:7


RUN yum clean all && \
      yum install -y yum install epel-release && \
      yum install -y https://repo.saltstack.com/yum/redhat/salt-repo-latest-2.el7.noarch.rpm && \
      yum update -y && \
      yum install -y sudo git tmux vim salt-master salt-minion && \
      yum clean all

EXPOSE 4505 4506

CMD /usr/bin/salt-master -d; /bin/bash
