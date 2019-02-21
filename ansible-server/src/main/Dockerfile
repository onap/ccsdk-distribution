FROM alpine:3.8

LABEL maintainer="SDN-C Team (sdnc@lists.openecomp.org)"
ARG PIP_TAG=18.0

WORKDIR /opt/

COPY ansible-server/requirements.txt ansible-server/requirements.txt

RUN apk add --no-cache curl \
                       bash \
                       py2-pip \
                       python2 &&\
    apk add --no-cache --virtual .build-deps build-base \
                                             libffi-dev \
                                             openssl-dev \
                                             python2-dev &&\
    pip install --no-cache-dir --upgrade pip==$PIP_TAG && \
    pip install --no-cache-dir -r ansible-server/requirements.txt &&\
    apk del .build-deps

RUN addgroup -S ansible && adduser -S ansible -G ansible
COPY --chown=ansible:ansible ansible-server ansible-server
COPY --chown=ansible:ansible configuration/ansible.cfg /etc/ansible/ansible.cfg


WORKDIR /opt/ansible-server

RUN mkdir /opt/onap ; ln -s /opt/ansible-server /opt/onap/ccsdk
RUN echo > /var/log/ansible-server.log
RUN chown ansible:ansible /var/log/ansible-server.log

USER ansible:ansible


EXPOSE 8000

##ENTRYPOINT ["python2", "RestServer.py"]
