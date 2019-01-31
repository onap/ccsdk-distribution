FROM alpine:3.8

LABEL maintainer="SDN-C Team (sdnc@lists.openecomp.org)"
ARG PIP_TAG=18.0

WORKDIR /opt/

COPY ansible-server/requirements.txt ansible-server/requirements.txt

RUN apk add --no-cache py2-pip \
                       python2 &&\
    apk add --no-cache --virtual .build-deps build-base \
                                             libffi-dev \
                                             openssl-dev \
                                             python2-dev &&\
    pip install --no-cache-dir --upgrade pip==$PIP_TAG && \
    pip install --no-cache-dir -r ansible-server/requirements.txt &&\
    apk del .build-deps

COPY ansible-server ansible-server
COPY configuration/ansible.cfg /etc/ansible/ansible.cfg

WORKDIR /opt/ansible-server

EXPOSE 8000

ENTRYPOINT ["python2", "RestServer.py"]
