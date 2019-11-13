FROM alpine:3.8

LABEL maintainer="SDN-C Team (sdnc@lists.openecomp.org)"
ARG PIP_TAG=18.0

WORKDIR /opt/

COPY ansible-server/requirements.txt ansible-server/requirements.txt

RUN apk add --no-cache curl \
                       iputils \
                       bash \
                       openssh-client \
                       python3 &&\
    apk add --no-cache --virtual .build-deps build-base \
                                             libffi-dev \
                                             openssl-dev \
                                             python3-dev &&\
    pip3 install --no-cache-dir --upgrade pip==$PIP_TAG && \
    pip3 install --no-cache-dir -r ansible-server/requirements.txt &&\
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
