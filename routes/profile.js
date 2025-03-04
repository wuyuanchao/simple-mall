const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../middleware/auth');
const { User, Order, OrderItem, Product } = require('../models');

// 个人中心页面
router.get('/', ensureAuthenticated, async (req, res) => {
  try {
    const user = await User.findByPk(req.session.user.id);
    const orderCount = await Order.count({ where: { userId: user.id } });
    
    res.render('profile/index', {
      title: '个人中心',
      user,
      orderCount
    });
  } catch (error) {
    console.error('获取个人信息失败:', error);
    req.flash('error_msg', '获取个人信息失败');
    res.redirect('/');
  }
});

module.exports = router;