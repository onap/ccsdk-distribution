#!/bin/bash
exec &> >(tee -a "/var/log/ansible-server.log")

if [ ! -f /tmp/.ansible-server-installed ]
then
    pip install PyMySQL
    pip install 'cherrypy<18.0.0'
    pip install requests

    apt-get update -y
    apt-get -y install software-properties-common
    apt-add-repository -y ppa:ansible/ansible
    apt-get -y install ansible

    cp /etc/ansible/ansible.cfg /etc/ansible/ansible.cfg.orig
    cat /etc/ansible/ansible.cfg.orig | sed -e 's/#host_key_checking/host_key_checking/' > /etc/ansible/ansible.cfg
    date > /tmp/.ansible-server-installed 2>&1
fi

cd /opt/onap/ccsdk
exec /usr/bin/python RestServer.py
