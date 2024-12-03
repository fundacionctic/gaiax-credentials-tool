FROM node:23.3.0-bookworm

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

COPY ssl.conf /etc/nginx/nginx.conf
COPY Taskfile.docker.yml /app/Taskfile.yml
COPY src /app/src

ENTRYPOINT [ "task" ]
