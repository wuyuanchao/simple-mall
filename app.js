const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');
const sequelize = require('./config/database');
require('dotenv').config();

const app = express();

// 设置模板引擎
const expressLayouts = require('express-ejs-layouts');
app.use(expressLayouts);
app.set('layout', 'layouts/main');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 中间件
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false
}));
app.use(flash());

// 全局变量中间件
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  next();
});

// 导入模型
require('./models');

// 数据库连接
sequelize.authenticate()
  .then(() => {
    console.log('数据库连接成功！');
    // 开发环境下可以使用 force: true 来重置数据库
    return sequelize.sync({ force: false });
  })
  .catch(err => {
    console.error('数据库连接错误：', err);
  });

// 导入控制器
const { getHomePage } = require('./controllers/homeController');
app.get('/', getHomePage);  // 保留首页路由

// 导入路由
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/product');
const orderRoutes = require('./routes/orders');
const profileRoutes = require('./routes/profile');
const adminRoutes = require('./routes/admin');

// 路由
app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.use('/profile', profileRoutes);
app.use('/admin', adminRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});