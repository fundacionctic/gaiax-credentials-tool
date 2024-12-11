FROM gcr.io/kaniko-project/executor AS kaniko

FROM node:23.3.0-bookworm

COPY --from=kaniko /kaniko/executor /kaniko/executor
COPY --from=kaniko /etc/nsswitch.conf /etc/nsswitch.conf
COPY --from=kaniko /kaniko/.docker /kaniko/.docker

EXPOSE 80
EXPOSE 443

WORKDIR /app

COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json

RUN apt-get update &&\
    apt-get install --no-install-recommends -y python3 python3-venv libaugeas0 nginx &&\
    apt-get clean &&\
    rm -rf /var/lib/apt/lists/* &&\
    python3 -m venv /opt/certbot/ &&\
    /opt/certbot/bin/pip install --upgrade pip &&\
    /opt/certbot/bin/pip install certbot &&\
    ln -s /opt/certbot/bin/certbot /usr/bin/certbot &&\
    curl -LOf https://github.com/go-task/task/releases/download/v3.40.0/task_linux_amd64.deb &&\
    dpkg -i task_linux_amd64.deb &&\
    npm install

COPY nginx.conf /app/nginx.conf
COPY Taskfile.common.yml /app/Taskfile.common.yml
COPY Taskfile.docker.yml /app/Taskfile.yml
COPY Dockerfile.server /app/Dockerfile.server
COPY Taskfile.server.yml /app/Taskfile.server.yml
COPY .env.default /app/.env.default
COPY src /app/src

ENV PATH=$PATH:/usr/local/bin:/kaniko

ENTRYPOINT [ "task" ]
