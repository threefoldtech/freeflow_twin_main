#!/bin/bash

cd apps/spawner && docker-compose down && docker-compose up -d --build && cd ../../docker/dev && docker-compose down && docker-compose up --build
