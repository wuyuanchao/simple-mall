const express = require('express');
const router = express.Router();
const { CartItem, Product } = require('../models');
const { ensureAuthenticated } = require('../middleware/auth');

// 查看购物车
router.get('/', ensureAuthenticated, async (req, res) => {
  try {
    const cartItems = await CartItem.findAll({
      where: { UserId: req.session.user.id },
      include: [Product]
    });

    res.render('cart/index', {
      title: '购物车',
      cartItems
    });
  } catch (error) {
    console.error('获取购物车失败:', error);
    req.flash('error_msg', '获取购物车失败');
    res.redirect('/');
  }
});

// 添加商品到购物车
router.post('/add', ensureAuthenticated, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    
    let cartItem = await CartItem.findOne({
      where: { 
        UserId: req.session.user.id,
        ProductId: productId
      }
    });

    if (cartItem) {
      await cartItem.update({
        quantity: cartItem.quantity + parseInt(quantity)
      });
    } else {
      await CartItem.create({
        UserId: req.session.user.id,
        ProductId: productId,
        quantity: parseInt(quantity)
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('添加到购物车失败:', error);
    res.status(500).json({ success: false, message: '添加失败' });
  }
});

// 更新购物车商品数量
router.put('/update/:id', ensureAuthenticated, async (req, res) => {
  try {
    const { quantity } = req.body;
    await CartItem.update(
      { quantity: parseInt(quantity) },
      { 
        where: { 
          id: req.params.id,
          UserId: req.session.user.id
        }
      }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

// 从购物车删除商品
router.delete('/remove/:id', ensureAuthenticated, async (req, res) => {
  try {
    await CartItem.destroy({
      where: { 
        id: req.params.id,
        UserId: req.session.user.id  // 修改这里，使用 session 中的用户 ID
      }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

module.exports = router;