FROM onap/integration-python:7.0.1

LABEL maintainer="SDN-C Team (sdnc@lists.openecomp.org)"
ARG PIP_TAG=18.0

WORKDIR /opt/

ENV http_proxy ${http_proxy}
ENV https_proxy ${https_proxy}
ENV PIP_EXTRA_OPTS ${https_proxy:+"--trusted-host pypi.org --trusted-host files.pythonhosted.org --proxy=${https_proxy}"}
ENV PIP_EXTRA_OPTS ${PIP_EXTRA_OPTS:-""}

USER root
COPY ansible-server/requirements.txt ansible-server/requirements.txt

RUN echo "https_proxy is ${https_proxy} ; PIP_EXTRA_OPTS is ${PIP_EXTRA_OPTS}"

RUN apk add --no-cache curl \
                       iputils \
                       bash \
                       openssh-client &&\
    apk add --no-cache --virtual .build-deps build-base \
                                             libffi-dev \
                                             openssl-dev \
                                             python3-dev &&\
    pip3 install --no-cache-dir --upgrade pip ${PIP_EXTRA_OPTS} && \
    pip3 install --no-cache-dir -r ansible-server/requirements.txt ${PIP_EXTRA_OPTS} &&\
    apk del .build-deps

RUN addgroup -S ansible && adduser -S ansible -G ansible

COPY --chown=ansible:ansible ansible-server ansible-server
COPY --chown=ansible:ansible configuration/ansible.cfg /etc/ansible/ansible.cfg

WORKDIR /opt/ansible-server

RUN mkdir /opt/onap ; ln -s /opt/ansible-server /opt/onap/ccsdk
RUN echo > /var/log/ansible-server.log
RUN chown -R ansible:ansible /var/log
RUN chown ansible:ansible /opt/ansible-server

USER ansible:ansible


EXPOSE 8000

##ENTRYPOINT ["python2", "RestServer.py"]
