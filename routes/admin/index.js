const express = require('express');
const router = express.Router();
const { ensureAdmin } = require('../../middleware/auth');
const { User, Order, Product } = require('../../models');
const { Op } = require('sequelize');
// 引入子路由
const productAdminRoutes = require('./products');
const orderAdminRoutes = require('./orders');
const userAdminRoutes = require('./users');
const settingsAdminRoutes = require('./settings');

// 管理后台首页
router.get('/', ensureAdmin, async (req, res) => {
  try {
    // 获取统计数据
    const [orderCount, userCount, productCount, totalSales, recentOrders] = await Promise.all([
      Order.count(),
      User.count(),
      Product.count(),
      Order.sum('totalAmount', {
        where: { status: 'completed' }
      }),
      Order.findAll({
        include: [{ model: User, attributes: ['username'] }],
        order: [['createdAt', 'DESC']],
        limit: 10
      })
    ]);

    res.render('admin/dashboard', {
      title: '管理后台',
      layout: false,
      path: '/admin',  // 添加这行来标识当前路径
      orderCount,
      userCount,
      productCount,
      totalSales: totalSales || 0,
      recentOrders
    });
  } catch (error) {
    console.error('获取仪表盘数据失败:', error);
    req.flash('error_msg', '获取数据失败');
    res.render('admin/dashboard', {
      title: '管理后台',
      layout: false,
      path: '/admin',  // 这里也要添加
      orderCount: 0,
      userCount: 0,
      productCount: 0,
      totalSales: 0,
      recentOrders: []
    });
  }
});

// 注册子路由 - 确保每个路由都正确导出了 Router 对象
router.use('/products', productAdminRoutes);
router.use('/orders', orderAdminRoutes);
router.use('/users', userAdminRoutes);
router.use('/settings', settingsAdminRoutes);

module.exports = router;