const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');
const sequelize = require('./config/database');
const { CartItem } = require('./models');
// 导入模型
require('./models');
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

// 在全局中间件部分添加
app.use(async (req, res, next) => {
  try {
    if (req.session.user) {
      const cartItemCount = await CartItem.count({
        where: { UserId: req.session.user.id }
      });
      res.locals.cartItemCount = cartItemCount;
    } else {
      res.locals.cartItemCount = 0;
    }
  } catch (error) {
    console.error('获取购物车数量失败:', error);
    res.locals.cartItemCount = 0;
  }
  next();
});

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
const cartRoutes = require('./routes/cart');
const adminRoutes = require('./routes/admin/index');

// 路由
app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.use('/profile', profileRoutes);
app.use('/admin', adminRoutes);
app.use('/cart', cartRoutes);

// 添加缓存控制中间件
app.use((req, res, next) => {
  // 针对静态资源和 CDN 资源设置缓存
  if (req.url.match(/\.(css|js|jpg|jpeg|png|gif|ico|woff|woff2|ttf|eot)$/)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // 缓存一年
  }
  next();
});

// 设置静态文件中间件
app.use(express.static('public', {
  maxAge: '1y',
  etag: true
}));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});