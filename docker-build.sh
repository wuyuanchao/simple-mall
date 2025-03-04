#!/bin/bash

# 构建镜像
docker build -t mall-app .

# 运行容器
docker run -d \
  --name mall \
  -p 3000:3000 \
  --add-host=host.docker.internal:host-gateway \
  -e NODE_ENV=production \
  mall-app