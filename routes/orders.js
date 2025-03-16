const express = require('express');
const router = express.Router();
const sequelize = require('../config/database');  // 添加这行
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

// 订单详情页
router.get('/:id', ensureAuthenticated, async (req, res) => {
  try {
    const order = await Order.findOne({
      where: {
        id: req.params.id,
        userId: req.session.user.id
      },
      include: [{
        model: OrderItem,
        include: [Product]
      }]
    });

    if (!order) {
      req.flash('error_msg', '订单不存在');
      return res.redirect('/orders');
    }

    res.render('orders/detail', {
      title: '订单详情',
      order
    });
  } catch (error) {
    console.error('获取订单详情失败:', error);
    req.flash('error_msg', '获取订单详情失败');
    res.redirect('/orders');
  }
});

// 取消订单
router.post('/:id/cancel', ensureAuthenticated, async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const order = await Order.findOne({
      where: {
        id: req.params.id,
        userId: req.session.user.id,
        status: 'pending'
      },
      include: [{
        model: OrderItem,
        include: [Product]
      }],
      transaction: t
    });

    if (!order) {
      throw new Error('订单不存在或无法取消');
    }

    // 更新订单状态
    await order.update({ status: 'cancelled' }, { transaction: t });

    // 恢复商品库存
    await Promise.all(order.OrderItems.map(item =>
      item.Product.increment('stock', { by: item.quantity, transaction: t })
    ));

    await t.commit();
    res.json({ success: true });
  } catch (error) {
    await t.rollback();
    console.error('取消订单失败:', error);
    res.status(400).json({ message: error.message || '取消订单失败' });
  }
});

// 确认收货
router.post('/:id/confirm', ensureAuthenticated, async (req, res) => {
  try {
    const order = await Order.findOne({
      where: {
        id: req.params.id,
        userId: req.session.user.id,
        status: 'shipped'
      }
    });

    if (!order) {
      throw new Error('订单不存在或无法确认收货');
    }

    await order.update({ status: 'completed' });
    res.json({ success: true });
  } catch (error) {
    console.error('确认收货失败:', error);
    res.status(400).json({ message: error.message || '确认收货失败' });
  }
});
// 支付订单
router.post('/:id/pay', ensureAuthenticated, async (req, res) => {
  try {
    const order = await Order.findOne({
      where: {
        id: req.params.id,
        userId: req.session.user.id,
        status: 'pending'
      }
    });

    if (!order) {
      throw new Error('订单不存在或无法支付');
    }

    await order.update({ status: 'paid' });
    res.json({ success: true });
  } catch (error) {
    console.error('支付订单失败:', error);
    res.status(400).json({ message: error.message || '支付订单失败' });
  }
});
module.exports = router;