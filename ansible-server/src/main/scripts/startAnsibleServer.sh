#!/bin/bash
exec &> >(tee -a "/var/log/ansible-server.log")

if [ ! -f /tmp/.ansible-server-installed ]
then
	if [ -f /etc/ansible/ansible.cfg ]
	then
		cp /etc/ansible/ansible.cfg /etc/ansible/ansible.cfg.orig
        cat /etc/ansible/ansible.cfg.orig | sed -e 's/#host_key_checking/host_key_checking/' > /etc/ansible/ansible.cfg
    else
    	if [ ! -d /etc/ansible ]
    	then
    		mkdir /etc/ansible
    	else
    		cat > /etc/ansible/ansible.cfg <<-END
[defaults]
host_key_checking = False
END
        fi
    date > /tmp/.ansible-server-installed 2>&1
fi

cd /opt/onap/ccsdk
exec /usr/bin/python RestServer.py
