const express = require('express');
const router = express.Router();
const sequelize = require('../config/database');  // 添加这行
const { CartItem, Product, Order, OrderItem } = require('../models');
const { ensureAuthenticated } = require('../middleware/auth');

// 结算页面
router.get('/', ensureAuthenticated, async (req, res) => {
  try {
    const cartItems = await CartItem.findAll({
      where: { UserId: req.session.user.id },
      include: [Product]
    });

    if (cartItems.length === 0) {
      req.flash('error_msg', '购物车为空');
      return res.redirect('/cart');
    }

    const total = cartItems.reduce((sum, item) => 
      sum + item.Product.price * item.quantity, 0
    );

    res.render('checkout/index', {
      title: '结算',
      cartItems,
      total
    });
  } catch (error) {
    console.error('获取结算信息失败:', error);
    req.flash('error_msg', '获取结算信息失败');
    res.redirect('/cart');
  }
});

// 提交订单
router.post('/', ensureAuthenticated, async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { address, phone, name } = req.body;
    const cartItems = await CartItem.findAll({
      where: { UserId: req.session.user.id },
      include: [Product],
      transaction: t
    });

    if (cartItems.length === 0) {
      throw new Error('购物车为空');
    }

    // 生成订单编号：日期 + 4位随机数
    const date = new Date();
    const dateStr = date.getFullYear().toString() +
                   (date.getMonth() + 1).toString().padStart(2, '0') +
                   date.getDate().toString().padStart(2, '0');
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const orderNumber = `ORD${dateStr}${randomNum}`;

    // 检查库存
    for (const item of cartItems) {
      if (item.Product.stock < item.quantity) {
        throw new Error(`商品 ${item.Product.name} 库存不足`);
      }
    }

    // 创建订单
    const order = await Order.create({
      orderNumber,  // 添加订单编号
      userId: req.session.user.id,
      status: 'pending',
      shippingAddress: address,
      recipientPhone: phone,
      recipientName: name,
      totalAmount: cartItems.reduce((sum, item) => sum + item.Product.price * item.quantity, 0),
      OrderItems: cartItems.map(item => ({
        ProductId: item.Product.id,
        quantity: item.quantity,
        price: item.Product.price,
        Product: {  // 添加 Product 关联
          id: item.productId
        }
      })),
      orderDate: date  // 添加订单日期
    }, {include: [{
      model: OrderItem
    }],
    transaction: t });

    // 清空购物车
    await CartItem.destroy({
      where: { UserId: req.session.user.id },
      transaction: t
    });

    await t.commit();
    res.redirect(`/orders/${order.id}`);
  } catch (error) {
    await t.rollback();
    console.error('创建订单失败:', error);
    req.flash('error_msg', '创建订单失败');
    res.redirect('/checkout');
  }
});

module.exports = router;