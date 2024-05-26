#!/usr/bin/env bash

yarn build
yarn nx zip back-end
docker compose up --build