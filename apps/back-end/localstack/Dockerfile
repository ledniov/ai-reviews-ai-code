ARG BASE_NODE_IMAGE=node:20

FROM ${BASE_NODE_IMAGE} as build

WORKDIR /app

COPY *.sh .

RUN mkdir monorepo

WORKDIR /app/monorepo

CMD /app/deploy.sh