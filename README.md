# 家具商城系统

一个基于 Node.js 和 Express 框架开发的家具商城系统，包含前台商城和后台管理功能。

## 环境要求

- Node.js >= 16.0.0
- MySQL >= 5.7
- npm >= 8.0.0

## 快速开始

1. 克隆项目
```bash
git clone <repository-url>
cd mall
```

项目结构：
```
mall/
├── config/             # 配置文件
├── database/           # 数据库相关文件
│   ├── schema/        # 数据库架构
│   └── init-db.sh     # 数据库初始化脚本
├── middleware/         # 中间件
├── models/            # 数据模型
├── public/            # 静态资源
│   ├── css/          # 样式文件
│   ├── js/           # JavaScript 文件
│   └── uploads/      # 上传文件目录
├── routes/            # 路由文件
├── views/             # 视图模板
│   ├── admin/        # 管理后台视图
│   └── partials/     # 公共视图组件
├── app.js            # 应用入口文件
├── package.json      # 项目依赖
└── README.md         # 项目说明
```

2. 安装依赖
```
npm install
```

3. 配置环境变量
```
cp .env.example .env
```
然后修改 .env 文件中的数据库配置：
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=mall
```
4. 初始化数据库
```
chmod +x database/init-db.sh
./database/init-db.sh
```

5. 启动项目
```
# 开发环境
npm run dev

# 生产环境
npm run prod
```

### Docker 部署
1. 构建镜像并运行
```
chmod +x docker-build.sh
./docker-build.sh
```

2. 
```
```