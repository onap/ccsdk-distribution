#!/bin/bash
exec &> >(tee -a "/var/log/ansible-server.log")

cd /opt/onap/ccsdk
exec /usr/bin/python RestServer.py

