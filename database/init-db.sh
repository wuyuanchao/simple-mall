#!/bin/bash

# 数据库配置
DB_USER="root"
DB_PASSWORD=
DB_NAME="mall"
SCHEMA_DIR="$(dirname "$0")/schema"

# 创建数据库
echo "Creating database ${DB_NAME}..."
mysql -u${DB_USER} -e "CREATE DATABASE IF NOT EXISTS ${DB_NAME};"

# 导入所有 SQL 文件
echo "Importing schema files..."
for sql_file in ${SCHEMA_DIR}/*.sql; do
    echo "Importing ${sql_file}..."
    mysql -u${DB_USER} ${DB_NAME} < ${sql_file}
done

echo "Database initialization completed!"