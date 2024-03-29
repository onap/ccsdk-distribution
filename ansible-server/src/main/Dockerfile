FROM onap/integration-python:8.0.0
LABEL maintainer="SDN-C Team (sdnc@lists.openecomp.org)"
USER root

ARG http_proxy
ARG https_proxy
ARG no_proxy
ARG CURL_CA_BUNDLE

ENV http_proxy $http_proxy
ENV https_proxy $https_proxy
ENV no_proxy $no_proxy
ENV PIP_EXTRA_OPTS ${https_proxy:+"--trusted-host pypi.org --trusted-host files.pythonhosted.org --proxy=${https_proxy}"}
ENV PIP_EXTRA_OPTS ${PIP_EXTRA_OPTS:-""}
ENV CURL_CA_BUNDLE=$CURL_CA_BUNDLE

ARG PIP_TAG=18.0

RUN addgroup -S ansible && adduser -S ansible -G ansible
COPY --chown=ansible:ansible ansible-server /opt/ansible-server
COPY --chown=ansible:ansible configuration/ansible.cfg /etc/ansible/ansible.cfg

# Copy any certs
COPY *.md *.pem /etc/ssl/certs/

# Install certs
RUN update-ca-certificates

RUN echo $CURL_CA_BUNDLE && ls -l $CURL_CA_BUNDLE

RUN apk add --no-cache curl iputils bash openssh-client \
    && curl -k https://sh.rustup.rs -sSf | sh -s -- -y \
    && source $HOME/.cargo/env \
    && apk add --no-cache --virtual .build-deps build-base libffi-dev openssl-dev python3-dev \
    && pip3 install --no-cache-dir --trusted-host pypi.org --trusted-host files.pythonhosted.org --upgrade pip ${PIP_EXTRA_OPTS} \
    && pip3 install --no-cache-dir --trusted-host pypi.org --trusted-host files.pythonhosted.org -r /opt/ansible-server/requirements.txt ${PIP_EXTRA_OPTS} \
    && apk del .build-deps \
    && mkdir -p /opt/onap \
    && touch /var/log/ansible-server.log \
    && chown -R ansible:ansible /var/log

USER ansible:ansible
EXPOSE 8000
WORKDIR /opt/ansible-server
##ENTRYPOINT ["python2", "RestServer.py"]
