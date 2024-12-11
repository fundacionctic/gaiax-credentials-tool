FROM gcr.io/kaniko-project/executor AS kaniko

FROM node:23.3.0-bookworm

COPY --from=kaniko /kaniko/executor /kaniko/executor
COPY --from=kaniko /etc/nsswitch.conf /etc/nsswitch.conf
COPY --from=kaniko /kaniko/.docker /kaniko/.docker

EXPOSE 80
EXPOSE 443

ENV PATH_APP=/app

WORKDIR ${PATH_APP}

COPY package.json ${PATH_APP}/package.json
COPY package-lock.json ${PATH_APP}/package-lock.json

ENV VERSION_TASK=3.40.0

RUN apt-get update &&\
    apt-get install --no-install-recommends -y python3 python3-venv libaugeas0 nginx &&\
    apt-get clean &&\
    rm -rf /var/lib/apt/lists/* &&\
    python3 -m venv /opt/certbot/ &&\
    /opt/certbot/bin/pip install --upgrade pip &&\
    /opt/certbot/bin/pip install certbot &&\
    ln -s /opt/certbot/bin/certbot /usr/bin/certbot &&\
    curl -LOf https://github.com/go-task/task/releases/download/v${VERSION_TASK}/task_linux_amd64.deb &&\
    dpkg -i task_linux_amd64.deb &&\
    rm task_linux_amd64.deb &&\
    npm install

COPY nginx.conf ${PATH_APP}/
COPY Taskfile.common.yml ${PATH_APP}/
COPY Taskfile.docker.yml ${PATH_APP}/
COPY Dockerfile.server ${PATH_APP}/
COPY Taskfile.server.yml ${PATH_APP}/
COPY .env.default ${PATH_APP}/
COPY src ${PATH_APP}/src

ENV PATH=$PATH:/usr/local/bin:/kaniko

ENTRYPOINT [ "task", "--taskfile", "Taskfile.docker.yml" ]
