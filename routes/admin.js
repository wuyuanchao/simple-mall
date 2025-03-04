const express = require('express');
const router = express.Router();
const { Order, OrderItem, Product, User } = require('../models');
const { ensureAuthenticated, ensureAdmin } = require('../middleware/auth');

// 订单管理页面
router.get('/orders', ensureAdmin, async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        {
          model: OrderItem,
          include: [Product]
        },
        {
          model: User,
          attributes: ['username', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.render('admin/orders', {
      title: '订单管理',
      orders,
      path: '/admin/orders',
      layout: false  // 添加这行，禁用默认布局
    });
  } catch (error) {
    console.error('获取订单列表失败:', error);
    req.flash('error_msg', '获取订单列表失败');
    res.redirect('/admin');
  }
});

// 更新订单状态
router.post('/orders/:id/status', ensureAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  try {
    await Order.update({ status }, { where: { id } });
    req.flash('success_msg', '订单状态更新成功');
    res.redirect('/admin/orders');
  } catch (error) {
    console.error('更新订单状态失败:', error);
    req.flash('error_msg', '更新订单状态失败');
    res.redirect('/admin/orders');
  }
});

module.exports = router;