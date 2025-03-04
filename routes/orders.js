const express = require('express');
const router = express.Router();
const { Order, OrderItem, Product } = require('../models');
const { ensureAuthenticated } = require('../middleware/auth');

// 订单列表页面
router.get('/', ensureAuthenticated, async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.session.user.id }, // 修改这里，使用 req.session.user.id
      include: [{
        model: OrderItem,
        include: [Product]
      }],
      order: [['createdAt', 'DESC']]
    });

    res.render('orders/index', {
      title: '我的订单',
      orders
    });
  } catch (error) {
    console.error('获取订单列表失败:', error);
    req.flash('error_msg', '获取订单列表失败');
    res.redirect('/');
  }
});

module.exports = router;